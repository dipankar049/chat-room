const express = require('express');
const router = express.Router();
const { fetchRoomChats, addChat } = require("../controller/ChatController");

router.get('/:roomId', fetchRoomChats);
router.post('/:roomId', addChat);

module.exports = router;