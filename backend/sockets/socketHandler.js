// 📁 sockets/socketHandler.js

const Room = require("../models/Room");
const Message = require("../models/Message");
const User = require("../models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("joinRoom", async ({ roomName, password, username }, callback) => {
      try {
        const room = await Room.findOne({ name: roomName });
        if (!room) return callback({ success: false, message: "Room not found" });

        if (room.password !== password)
            return callback({ success: false, message: "Incorrect password" });

        const user = await User.findOne({ username });
        if (user && !room.members.includes(user._id)) {
          room.members.push(user._id);
          await room.save();
        }

        socket.join(roomName);
        socket.username = username;
        socket.room = roomName;

        const messages = await Message.find({ room: room._id })
          .populate("sender", "username")
          .sort({ createdAt: 1 });

        const history = messages.map((msg) => ({
          username: msg.system ? "System" : msg.sender?.username || "Anonymous",
          message: msg.message,
          time: msg.createdAt.toLocaleTimeString(),
          system: msg.system,
        }));

        const joinMsg = {
          message: `${username} joined the room`,
          system: true,
          time: new Date().toLocaleTimeString(),
        };

        const systemMessage = new Message({
          room: room._id,
          message: joinMsg.message,
          system: true,
        });
        await systemMessage.save();

        io.to(roomName).emit("receiveMessage", joinMsg);
        callback({ success: true, history });
      } catch (err) {
        console.error("Join Room Error:", err);
        callback({ success: false, message: "Internal server error" });
      }
    });

    socket.on("sendMessage", async (msgText) => {
      if (!socket.room || !socket.username) return;

      try {
        const room = await Room.findOne({ name: socket.room });
        const user = await User.findOne({ username: socket.username });

        const newMsg = new Message({
          room: room._id,
          sender: user?._id,
          message: msgText,
          system: false,
        });
        await newMsg.save();

        const messageData = {
          username: socket.username,
          message: msgText,
          time: newMsg.createdAt.toLocaleTimeString(),
          system: false,
        };

        io.to(socket.room).emit("receiveMessage", messageData);
      } catch (err) {
        console.error("Send Message Error:", err);
      }
    });

    socket.on("disconnect", async () => {
      if (!socket.room || !socket.username) return;
      try {
        const room = await Room.findOne({ name: socket.room });

        const msg = new Message({
          room: room._id,
          message: `${socket.username} left the room`,
          system: true,
        });
        await msg.save();

        io.to(socket.room).emit("receiveMessage", {
          message: msg.message,
          system: true,
          time: new Date().toLocaleTimeString(),
        });

        console.log(`${socket.username} disconnected`);
      } catch (err) {
        console.error("Disconnect Error:", err);
      }
    });
  });
};
