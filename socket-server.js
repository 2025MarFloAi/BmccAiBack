const { Server } = require("socket.io");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

module.exports = initSocketServer;
