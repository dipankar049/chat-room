const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

// Database connection
const dbConnection = require('./database/dbConnection');

// Routes
const UserRoutes = require('./routes/UserRoutes');
const ChatRoutes = require('./routes/ChatRoutes');
const RoomRoutes = require('./routes/RoomRoutes');

// Socket handler
const socketHandler = require('./sockets/socketHandler');

// Initialize app
dbConnection();
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
socketHandler(io);

// Middlewares
app.use(express.json());
app.use(cors());

// REST API routes
app.use('/user', UserRoutes);
app.use('/room', RoomRoutes);
app.use('/chat', ChatRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send("Chat room server is running...");
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});