const Room = require("../models/Room");
const Message = require("../models/Message");
const { default: mongoose } = require("mongoose");

const roomUsers = {};

module.exports = function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("roomCreated", (createdRoom) => {
      io.emit("newRoom", createdRoom);
    });

    // Join room
    socket.on("joinRoom", async ({ roomName, username, userId }, callback) => {
      try {
        // Validate room exists BEFORE joining
        const room = await Room.findOne({ name: roomName });
        if (!room) {
          return callback({ success: false, error: "Room not found" });
        }

        socket.join(roomName);
        socket.roomName = roomName;
        socket.username = username;
        socket.userId = userId;

        if (!roomUsers[roomName]) roomUsers[roomName] = [];
        const exists = roomUsers[roomName].some(u => u.userId === userId);

        if (!exists) {
          roomUsers[roomName].push({
            userId,
            username
          });
        }

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
            senderId: "system",
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

    socket.on("sendMessage", async ({ text }, callback) => {
      try {
        const { roomName, username, userId } = socket;
        
        // Quick validation
        if (!roomName || !username || !userId) {
          return callback?.({ success: false, error: "Invalid session data" });
        }
        if (!text || !text.trim()) {
          return callback?.({ success: false, error: "Message cannot be empty" });
        }

        // Create message object with status
        const messageId = new mongoose.Types.ObjectId();
        const message = {
          _id: messageId,
          room: roomName,
          senderName: username,
          senderId: userId,
          text: text.trim(),
          createdAt: new Date(),
          status: "sent", // Initial status
        };

        // Emit immediately
        socket.to(roomName).emit("receiveMessage", message);
        
        // Acknowledge immediately
        callback?.({ success: true, message });

        // Save to DB asynchronously
        setImmediate(async () => {
          try {
            const room = await Room.findOne({ name: roomName });
            if (room) {
              const messageDoc = new Message({
                _id: messageId,
                room: room._id,
                senderName: username,
                senderId: userId,
                text: text.trim(),
                createdAt: message.createdAt,
              });
              await messageDoc.save();
              
              // Notify sender that message is saved (delivered)
              // socket.emit("messageDelivered", { 
              //   messageId: messageId.toString(),
              //   status: "delivered" 
              // });
            }
          } catch (err) {
            console.error("Background save failed:", err);
            
            // Notify sender that save failed
            socket.emit("messageFailed", { 
              messageId: messageId.toString(),
              status: "failed",
              error: "Failed to save message"
            });
          }
        });

      } catch (err) {
        console.error("Send message error:", err);
        callback?.({ 
          success: false, 
          error: "Failed to send message" 
        });
      }
    });

    // Typing
    socket.on("typing", () => {
      try {
        if (socket.roomName && socket.username) {
          socket.to(socket.roomName).emit("userTyping", {
            username: socket.username,
            userId: socket.userId
          });
        }
      } catch (err) {
        console.error("Typing event error:", err);
      }
    });

    socket.on("stopTyping", () => {
      try {
        if (socket.roomName && socket.username) {
          socket.to(socket.roomName).emit("userStopTyping", {
            userId: socket.userId
          });
        }
      } catch (err) {
        console.error("Stop typing event error:", err);
      }
    });

    // Get users
    socket.on("getRoomUsers", (roomName, callback) => {
      try {
        const users = roomUsers[roomName] || [];
        callback({ count: users.length });
      } catch (err) {
        console.error("Get room users error:", err);
        callback({ count: 0, error: "Failed to get users" });
      }
    });

    socket.on("leaveRoom", async ({ roomName, username, userId }) => {
      try {
        if (!roomName || !username || !userId) return;

        socket.leave(roomName);

        // Remove user from room list
        roomUsers[roomName] = (roomUsers[roomName] || []).filter(
          (u) => u.userId !== userId
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
            senderId: "system",
            text: `${username} left the room`,
            system: true,
          });
          await systemMessage.save();
          io.to(roomName).emit("receiveMessage", systemMessage.toObject());
        }
      } catch (err) {
        console.error("Leave room error:", err);
      }
    });

    socket.on("deleteRoom", async ({ roomName }) => {
      try {
        console.log("Deleting room from socket:", roomName);

        // Kick everyone out of the room
        io.in(roomName).socketsLeave(roomName);

        // Remove room from memory map
        delete roomUsers[roomName];

        // Notify all clients
        io.emit("roomRemoved", { roomName });
      } catch (err) {
        console.error("Delete room error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
      
      // Clean up user from all rooms on disconnect
      try {
        for (const roomName in roomUsers) {
          roomUsers[roomName] = roomUsers[roomName].filter(
            (u) => u.userId !== socket.userId
          );
          
          if (roomUsers[roomName].length === 0) {
            delete roomUsers[roomName];
          } else {
            io.emit("updateUsers", {
              roomName,
              userList: roomUsers[roomName],
              count: roomUsers[roomName].length,
            });
          }
        }
      } catch (err) {
        console.error("Disconnect cleanup error:", err);
      }
    });
  });
};