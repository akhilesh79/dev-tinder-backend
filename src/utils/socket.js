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

  // this event is emitted by client when user opens chat window with another user
  io.on('connection', (socket) => {
    socket.on('joinChat', async ({ sourceUser, targetUser }) => {
      const chat = await Chat.findOne({ participants: { $all: [sourceUser.userId, targetUser.userId] } });
      if (!chat) {
        const roomHash = createRoomHash(sourceUser.userId, targetUser.userId);
        await Chat.create({
          roomHash,
          participants: [sourceUser.userId, targetUser.userId],
          messages: [],
        });

        console.log(`Created new chat room ${roomHash} for users ${sourceUser.name} and ${targetUser.name}`);
        socket.join(roomHash);
      } else {
        console.log(`Chat room ${chat.roomHash} already exists, joining existing room`);
        chat.messages.forEach((msg) => {
          if (msg.sender.toString() === sourceUser.userId.toString()) {
          }
        });
        socket.join(chat.roomHash);
      }
    });

    socket.on('sendMessage', async ({ sourceUser, targetUser, text }) => {
      try {
        const roomHash = createRoomHash(sourceUser.userId, targetUser.userId);

        // check if both are having connections
        const connectionExists = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: sourceUser.userId, toUserId: targetUser.userId, status: 'accepted' },
            { fromUserId: targetUser.userId, toUserId: sourceUser.userId, status: 'accepted' },
          ],
        });

        if (!connectionExists) {
          console.error('Users are not connected, cannot send message');
          throw new Error('Users are not connected');
        }

        const chat = await Chat.findOne({ participants: { $all: [sourceUser.userId, targetUser.userId] } });

        if (!chat || chat.roomHash !== roomHash) {
          console.error('Chat room not found for users, cannot send message');
          throw new Error('Chat room not found');
        }

        const sentMessageTime = new Date();
        chat.messages.push({
          text,
          sender: sourceUser.name,
          status: 'sent',
          time: sentMessageTime,
        });
        await chat.save();

        io.to(roomHash).emit('receiveMessage', {
          text,
          sender: sourceUser.name,
          status: 'sent',
          time: sentMessageTime,
        });
      } catch (err) {
        console.error('Error in sendMessage event:', err.message);
        throw new Error('Error sending message');
      }
    });

    socket.on('disconnect', () => {});
  });
};

module.exports = initSocket;
