let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: "*", // یا origin خاص کلاینت
        methods: ["GET", "POST"]
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      const error = new Error('Socket.io is not initialized!');
      error.statusCode = 500;
      throw error;
    }
    return io;
  },
};
