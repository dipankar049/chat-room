const express = require('express');
const router = express.Router();
const {
  fetchAllRooms,
  createRoom,
  deleteRoom,
  joinRoom
} = require('../controller/RoomController');

router.get('/', fetchAllRooms);
router.post('/', createRoom);
router.delete('/:roomId', deleteRoom);
router.post('/joinByName', joinRoom);

module.exports = router;