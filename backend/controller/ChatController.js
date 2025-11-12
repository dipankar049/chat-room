const Message = require('../models/Message');

// Get messages by room
const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ room: roomId }).populate('sender', 'username email');
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save message
const saveMessage = async (req, res) => {
  const { roomId } = req.params;
  const { message, senderId, system = false } = req.body;

  if (!message || !roomId) {
    return res.status(400).json({ message: "Something went wrong" });
  }

  try {
    const newMsg = new Message({ message, sender: senderId, room: roomId, system });
    await newMsg.save();
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getRoomMessages,
  saveMessage
};