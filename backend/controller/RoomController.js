const Room = require("../models/Room");

const fetchAllRooms = async(req, res) => {
    try {

    } catch(err) {
        console.log("Error:", err);
        res.status(500).json({ error: "Error occured"});
    }
}

const createRoom = async(req, res) => {
    try {

    } catch(err) {
        console.log("Error:", err);
        res.status(500).json({ error: "Error occured"});
    }
}

const deleteRoom = async(req, res) => {
    try {

    } catch(err) {
        console.log("Error:", err);
        res.status(500).json({ error: "Error occured"});
    }
}

module.exports = { fetchAllRooms, createRoom, deleteRoom };