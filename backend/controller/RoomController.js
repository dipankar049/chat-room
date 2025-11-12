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

    // Limit for Guest Users -> max 2 rooms
    if (guestOwnerId) {
      const guestRooms = await Room.find({ guestOwnerId });
      if (guestRooms.length >= 2) {
        return res.status(409).json({
          success: false,
          message: "Guest users can only create maximum 2 rooms."
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
        members: [ownerId]
      });
      await room.save();
      await User.findByIdAndUpdate(ownerId, { $push: { createdRooms: room._id } });
    } else {
      // Guest user
      room = new Room({
        name,
        type,
        guestOwnerId,
        isTemporary: true
      });
      await room.save();
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
    const { roomId, username } = req.body;

    const room = await Room.findById(roomId).populate("owner", "username");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    console.log(username, room.guestOwnerId)

    // authorization check
    if (room.owner) {
      // registered user
      if (room.owner.username !== username) {
        return res.status(403).json({ message: "You are not allowed to delete this room" });
      }
    } else {
      // guest user
      if (room.guestOwnerId !== username) {
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
  const { userId, roomName } = req.body;

  try {
    const room = await Room.findOne({ name: roomName });
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    // Get chat history if needed
    const messages = await Message.find({ room: room._id }).sort({ createdAt: 1 });

    res.status(200).json({ message: "Joined room successfully", room, history: messages });
  } catch (err) {
    console.error("Join Room Error:", err);
    res.status(500).json({ success: false, message: "failed to join room" });
  }
};


module.exports = {
  fetchAllRooms,
  createRoom,
  deleteRoom,
  joinRoom
};