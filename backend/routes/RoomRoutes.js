const express = require('express');
const router = express.Router();
const { fetchAllRooms, createRoom, deleteRoom } = require("../controller/RoomController");

router.get('/', fetchAllRooms);
router.post('/', createRoom);
router.delete('/:roomId', deleteRoom);

module.exports = router;