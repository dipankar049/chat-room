const express = require('express');
const router = express.Router();
const {
  getRoomMessages,
  saveMessage
} = require('../controller/ChatController');

router.get('/:roomId', getRoomMessages);
router.post('/send/:roomId', saveMessage);

module.exports = router;
