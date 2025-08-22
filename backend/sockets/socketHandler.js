const Room = require("../models/Room");
const Message = require("../models/Message");

const roomUsers = {};

module.exports = function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("New client connected");

    // Join room
    socket.on("joinRoom", async ({ roomName, username }, callback) => {
      try {
        socket.join(roomName);
        socket.roomName = roomName;
        socket.username = username;

        if (!roomUsers[roomName]) roomUsers[roomName] = [];
        if (!roomUsers[roomName].includes(username)) roomUsers[roomName].push(username);

        const room = await Room.findOne({ name: roomName });
        let history = [];
        if (room) {
          history = await Message.find({ room: room._id }).sort({ createdAt: -1 }).limit(50).lean();
          history.reverse();
        }

        if (callback) callback({ success: true, history });

        // System join message
        if (room) {
          const systemMessage = new Message({
            room: room._id,
            senderName: "System",
            text: `${username} joined the room`,
            system: true,
          });
          await systemMessage.save();
          io.to(roomName).emit("receiveMessage", systemMessage.toObject());
        }

        io.to(roomName).emit("updateUsers", roomUsers[roomName]);
      } catch (err) {
        console.error("Join room error:", err);
        if (callback) callback({ success: false, error: "Failed to join room" });
      }
    });

    // Send message
    socket.on("sendMessage", async ({ text }) => {
      const { roomName, username } = socket;
      if (!roomName || !username) return;

      try {
        const room = await Room.findOne({ name: roomName });
        if (!room) return;

        const message = new Message({
          room: room._id,
          senderName: username,
          text,
        });
        await message.save();

        io.to(roomName).emit("receiveMessage", message.toObject());

      } catch (err) {
        console.error(err);
      }
    });

    // Typing
    socket.on("typing", () => {
      if (socket.roomName && socket.username) socket.to(socket.roomName).emit("userTyping", socket.username);
    });
    socket.on("stopTyping", () => {
      if (socket.roomName && socket.username) socket.to(socket.roomName).emit("userStopTyping", socket.username);
    });

    // Disconnect
    socket.on("disconnect", async () => {
      const { roomName, username } = socket;
      if (!roomName || !username) return;

      // Check if the same user is still connected with another socket
      const stillConnected = [...io.sockets.sockets.values()].some(
        (s) => s.username === username && s.id !== socket.id
      );
      if (stillConnected) return;

      // Remove user from room list
      roomUsers[roomName] = (roomUsers[roomName] || []).filter(
        (u) => u !== username
      );

      const room = await Room.findOne({ name: roomName });
      if (room) {
        const systemMessage = new Message({
          room: room._id,
          senderName: "System",
          text: `${username} left the room`,
          system: true,
        });
        await systemMessage.save();
        io.to(roomName).emit("receiveMessage", systemMessage.toObject());
      }

      io.to(roomName).emit("updateUsers", roomUsers[roomName]);
    });

  });
};
