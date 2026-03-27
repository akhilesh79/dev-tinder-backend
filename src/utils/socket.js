const socket = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ConnectionRequest = require('../models/connectionRequest');
const Chat = require('../models/chat');

const createRoomHash = (userId1, userId2) => {
  const stringValue = [userId1, userId2].sort().join('_');
  return crypto.createHash('sha256').update(stringValue).digest('hex');
};

// Helper: count how many sockets from a specific user are in a room
const getUsersInRoom = (io, roomHash) => {
  const room = io.sockets.adapter.rooms.get(roomHash);
  if (!room) return new Set();
  const userIds = new Set();
  for (const socketId of room) {
    const s = io.sockets.sockets.get(socketId);
    if (s?.user?._id) userIds.add(s.user._id);
  }
  return userIds;
};

const initSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  // middleware to authenticate socket connection using JWT token from cookies
  io.use((socket, next) => {
    const cookieToken = socket.handshake.headers.cookie;
    if (!cookieToken) {
      console.error('No cookies found in socket handshake');
      return next(new Error('Authentication error: No token provided'));
    }

    const parsedCookie = cookie.parse(cookieToken);
    const token = parsedCookie.token;
    if (!token) {
      console.error('No token found in cookies');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_ID);
      socket.user = decoded;
      console.log(`Socket authenticated for user ${decoded._id}`);
      next();
    } catch (err) {
      console.error('JWT verification failed:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // joinChat: create/find room, send chat history, mark unread as delivered
    socket.on('joinChat', async ({ sourceUser, targetUser }) => {
      try {
        const roomHash = createRoomHash(sourceUser.userId, targetUser.userId);
        let chat = await Chat.findOne({ participants: { $all: [sourceUser.userId, targetUser.userId] } });

        if (!chat) {
          chat = await Chat.create({
            roomHash,
            participants: [sourceUser.userId, targetUser.userId],
            messages: [],
          });
          console.log(`Created new chat room ${roomHash}`);
        }

        socket.join(roomHash);

        // Mark all messages FROM the other user as 'delivered' (if still 'sent')
        let hasUpdates = false;
        chat.messages.forEach((msg) => {
          if (msg.sender.toString() === targetUser.userId && msg.status === 'sent') {
            msg.status = 'delivered';
            hasUpdates = true;
          }
        });

        if (hasUpdates) {
          await chat.save();
          // Notify the room so the sender sees updated statuses
          io.to(roomHash).emit('messageStatusBulkUpdate', {
            status: 'delivered',
            updatedBy: sourceUser.userId,
          });
        }
      } catch (err) {
        console.error('Error in joinChat:', err.message);
      }
    });

    // sendMessage: save to DB, determine initial status, broadcast
    socket.on('sendMessage', async ({ sourceUser, targetUser, text }) => {
      try {
        const roomHash = createRoomHash(sourceUser.userId, targetUser.userId);

        const connectionExists = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: sourceUser.userId, toUserId: targetUser.userId, status: 'accepted' },
            { fromUserId: targetUser.userId, toUserId: sourceUser.userId, status: 'accepted' },
          ],
        });

        if (!connectionExists) {
          socket.emit('chatError', { message: 'Users are not connected' });
          return;
        }

        const chat = await Chat.findOne({ participants: { $all: [sourceUser.userId, targetUser.userId] } });

        if (!chat || chat.roomHash !== roomHash) {
          socket.emit('chatError', { message: 'Chat room not found' });
          return;
        }

        // Check if the target user is currently in the room
        const usersInRoom = getUsersInRoom(io, roomHash);
        const isTargetInRoom = usersInRoom.has(targetUser.userId);

        const initialStatus = isTargetInRoom ? 'delivered' : 'sent';
        const sentMessageTime = new Date();

        chat.messages.push({
          text,
          sender: sourceUser.userId,
          status: initialStatus,
          time: sentMessageTime,
        });
        await chat.save();

        const savedMsg = chat.messages[chat.messages.length - 1];

        io.to(roomHash).emit('receiveMessage', {
          _id: savedMsg._id,
          text,
          sender: sourceUser.userId,
          status: initialStatus,
          time: sentMessageTime,
        });
      } catch (err) {
        console.error('Error in sendMessage:', err.message);
        socket.emit('chatError', { message: 'Error sending message' });
      }
    });

    // markAsRead: when user views messages, mark other user's messages as 'read'
    socket.on('markAsRead', async ({ sourceUser, targetUser }) => {
      try {
        const roomHash = createRoomHash(sourceUser.userId, targetUser.userId);
        const chat = await Chat.findOne({ roomHash });
        if (!chat) return;

        let hasUpdates = false;
        chat.messages.forEach((msg) => {
          if (msg.sender.toString() === targetUser.userId && msg.status !== 'read') {
            msg.status = 'read';
            hasUpdates = true;
          }
        });

        if (hasUpdates) {
          await chat.save();
          io.to(roomHash).emit('messageStatusBulkUpdate', {
            status: 'read',
            updatedBy: sourceUser.userId,
          });
        }
      } catch (err) {
        console.error('Error in markAsRead:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user?._id}`);
    });
  });
};

module.exports = initSocket;
