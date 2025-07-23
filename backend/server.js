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

io.on("connection", (socket) => {
    console.log("User joined chat room", socket.id);

    socket.on("joinRoom", ({ username, room }) => {
        if (!username) {
            username = `Guest-${socket.id.slice(0, 5)}`;
        }

        socket.join(room);
        socket.username = username;
        socket.room = room;

        // Notify others about new user joined the room
        socket.to(room).emit("receiveMessage", {
            message: `${username} joined the room`,
            system: true,
            time: new Date().toLocaleTimeString(),
        });

        console.log(`${username} joined room: ${room}`);
    })

    socket.on("sendMessage", (msg) => {
        console.log("New message", msg);
        const messageData = {
            username: socket.username,
            message: msg,
            system: false,
            time: new Date().toLocaleTimeString(),
        }
        io.to(socket.room).emit("receiveMessage", messageData);
    });

    socket.on("disconnect", () => {
        if(socket.room && socket.username) {
            io.to(socket.room).emit("receiveMessage", {
                message: `${socket.username} left the room`,
                system: true,
                time: new Date().toLocaleTimeString(),
            });
        console.log("client disconnected", socket.id);
        }
    });
});

app.get('/', (req, res) => { res.send("Chat room server is running...")} );

server.listen(8000, () => {
    console.log("Server running on port 8000");
})

