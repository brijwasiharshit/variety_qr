const socket = require("socket.io");

const initalizeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5000",
    },
  });

  io.on("connection", (socket) => {
    socket.on("watchOrders", () => {});
    socket.on("disconnect", () => {});
  });
};

module.exports = initalizeSocket;
