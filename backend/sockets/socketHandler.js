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

        io.emit("updateUsers", {
          roomName,
          userList: roomUsers[roomName],
          count: roomUsers[roomName].length,
        });
      } catch (err) {
        console.error("Join room error:", err);
        if (callback) callback({ success: false, error: "Failed to join room" });
      }
    });

    socket.on("sendMessage", ({ text }) => {
      const { roomName, username } = socket;
      if (!roomName || !username) return;

      // Create message object (not yet saved)
      const message = {
        room: roomName,
        senderName: username,
        text,
        createdAt: new Date(),
      };

      // Emit immediately (real-time feeling)
      io.to(roomName).emit("receiveMessage", message);

      // Save in DB in background
      Room.findOne({ name: roomName })
        .then((room) => {
          if (!room) return;
          return new Message({ ...message, room: room._id }).save();
        })
        .catch((err) => {
          console.error("Failed to send message:", err);
        });
    });


    // Typing
    socket.on("typing", () => {
      if (socket.roomName && socket.username) socket.to(socket.roomName).emit("userTyping", socket.username);
    });
    socket.on("stopTyping", () => {
      if (socket.roomName && socket.username) socket.to(socket.roomName).emit("userStopTyping", socket.username);
    });

    // Get users in a specific room
    socket.on("getRoomUsers", (roomName, callback) => {
      const users = roomUsers[roomName] || [];
      callback({ count: users.length });
    });

    // Left room
    // Leave room
    socket.on("leaveRoom", async ({ roomName, username }) => {
      if (!roomName || !username) return;

      socket.leave(roomName);

      // Remove user from room list
      roomUsers[roomName] = (roomUsers[roomName] || []).filter(
        (u) => u !== username
      );

      // Update users only in that room
      io.emit("updateUsers", {
        roomName,
        userList: roomUsers[roomName],
        count: roomUsers[roomName].length,
      });

      // System message
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
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
    });

  });
};
