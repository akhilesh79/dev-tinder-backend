const onlineUsers = new Map();

const getUserKey = (userId) => userId.toString();

const getUserRoom = (userId) => `user:${getUserKey(userId)}`;

const addUserSocket = (userId, socketId) => {
  const userKey = getUserKey(userId);
  const sockets = onlineUsers.get(userKey) || new Set();
  const wasOffline = sockets.size === 0;

  sockets.add(socketId);
  onlineUsers.set(userKey, sockets);

  return wasOffline;
};

const removeUserSocket = (userId, socketId) => {
  const userKey = getUserKey(userId);
  const sockets = onlineUsers.get(userKey);

  if (!sockets) {
    return false;
  }

  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userKey);
    return true;
  }

  onlineUsers.set(userKey, sockets);
  return false;
};

const isUserOnline = (userId) => onlineUsers.has(getUserKey(userId));

module.exports = {
  addUserSocket,
  getUserRoom,
  isUserOnline,
  removeUserSocket,
};
