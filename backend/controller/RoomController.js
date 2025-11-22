const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');

// Get all rooms
const fetchAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new room
const createRoom = async (req, res) => {
  const { name, type = "public", ownerId, ownerName } = req.body;

  if (!name || !ownerId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Limit for Registered Users -> max 5 rooms
    if (ownerId) {
      const existingUserRoom = await Room.find({ owner: ownerId });
      if (existingUserRoom.length >= 5) {
        return res.status(409).json({
          success: false,
          message: "You can have max 5 rooms. Please delete old rooms to create a new one."
        });
      }
    }

    // Check if room with same name exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(409).json({ success: false, message: "Room name already taken" });
    }

    let room;
    if (ownerId) {
      // Registered user
      room = new Room({
        name,
        type,
        owner: ownerId,
        ownerName,
        members: [{ userId: ownerId, username: ownerName }]
      });
      await room.save();
      await User.findOneAndUpdate(
        { _id: ownerId },
        { $push: { createdRooms: room._id } },
        { new: true }
      ).catch(() => {});
    }

    res.status(201).json(room);
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Room creation failed' });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const { roomId, userId, username } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }


    // authorization check
    if (room.owner) {
      // registered user
      if (room.owner !== userId) {
        return res.status(403).json({ message: "You are not allowed to delete this room" });
      }
    }

    await room.deleteOne();
    return res.status(200).json({ message: "Room deleted" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// Join room
const joinRoom = async (req, res) => {
  const { userId, roomName, username } = req.body;

  try {
    const room = await Room.findOne({ name: roomName });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if user is already in members array
    const alreadyMember = room.members.some(m => m.userId === userId);

    if (!alreadyMember) {
      room.members.push({
        userId,
        username
      });
      await room.save();
    }

    // Fetch chat history
    const messages = await Message.find({ room: room._id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Joined room successfully",
      room,
      history: messages
    });
  } catch (err) {
    console.error("Join Room Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to join room"
    });
  }
};


module.exports = {
  fetchAllRooms,
  createRoom,
  deleteRoom,
  joinRoom
};