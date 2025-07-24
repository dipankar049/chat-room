const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const roomStore = new Map();     // room → password
const messageStore = new Map();  // room → [{ username, message, time, system }]

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("getRooms", () => {
    const roomNames = Array.from(roomStore.keys());
    socket.emit("roomsList", roomNames);
  });

  socket.on("createRoom", ({ room, password }, callback) => {
    if (!room || !password) {
      return callback({ success: false, message: "Room name and password required" });
    }

    if (roomStore.has(room)) {
      return callback({ success: false, message: "Room already exists" });
    }

    roomStore.set(room, password);
    console.log(`Room created: ${room}`);
    callback({ success: true });
  });

  socket.on("joinRoom", ({ username, room, password }, callback) => {
    const storedPassword = roomStore.get(room);
    if (storedPassword !== password) {
      return callback({ success: false, message: "Invalid room password" });
    }

    if(username === "") username = `Guest-${socket.id.slice(0, 5)}`;

    socket.join(room);
    socket.username = username;
    socket.room = room;

    const history = messageStore.get(room) || [];

    const joinMsg = {
      message: `${username} joined the room`,
      system: true,
      time: new Date().toLocaleTimeString(),
    };
    io.to(room).emit("receiveMessage", joinMsg);

    if (!messageStore.has(room)) messageStore.set(room, []);
    messageStore.get(room).push(joinMsg);

    callback({ success: true, history });
  });

  socket.on("sendMessage", (msg) => {
    const messageData = {
      username: socket.username,
      message: msg,
      system: false,
      time: new Date().toLocaleTimeString(),
    };

    if (!messageStore.has(socket.room)) messageStore.set(socket.room, []);
    messageStore.get(socket.room).push(messageData);

    io.to(socket.room).emit("receiveMessage", messageData);
  });

  socket.on("disconnect", () => {
    if (socket.room && socket.username) {
      io.to(socket.room).emit("receiveMessage", {
        message: `${socket.username} left the room`,
        system: true,
        time: new Date().toLocaleTimeString(),
      });
      console.log(`${socket.username} disconnected`);
    }
  });
});

app.get('/', (req, res) => {
  res.send("Chat room server is running...");
});

server.listen(8000, () => {
  console.log("Server running on port 8000");
});
