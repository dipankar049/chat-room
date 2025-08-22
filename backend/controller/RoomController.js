const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');

// Get all rooms
const fetchAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('owner', 'username email');
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new room
const createRoom = async (req, res) => {
  const { name, type = "public", ownerId, guestOwnerId } = req.body;
  console.log(name, ownerId, guestOwnerId);

  if (!name || (!ownerId && !guestOwnerId)) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if room with same name exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(409).json({ message: "Room name already taken" });
    }

    let room;
    if (ownerId) {
      // Registered user
      room = new Room({
        name,
        // password,
        type,
        owner: ownerId,
        members: [ownerId]
      });
      await room.save();
      await User.findByIdAndUpdate(ownerId, { $push: { createdRooms: room._id } });
    } else {
      // Guest user
      room = new Room({
        name,
        // password,
        type,
        guestOwnerId,
        isTemporary: true
      });
      await room.save();
    }

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    await Room.findByIdAndDelete(roomId);
    res.status(200).json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Join room
const joinRoom = async (req, res) => {
  const { userId, roomName } = req.body;

  try {
    const room = await Room.findOne({ name: roomName });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    // Optional: Get chat history if needed
    const messages = await Message.find({ room: room._id }).sort({ createdAt: 1 });

    res.status(200).json({ message: "Joined room", room, history: messages });
  } catch (err) {
    console.error("Join Room Error:", err);
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  fetchAllRooms,
  createRoom,
  deleteRoom,
  joinRoom
};