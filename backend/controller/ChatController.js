const Chat = require("../models/Message");

const fetchRoomChats = async(req, res) => {
    try {

    } catch(err) {
        console.log("Error:", err);
        res.status(500).json({ error: "Error occured"});
    }
}

const addChat = async(req, res) => {
    try {

    } catch(err) {
        console.log("Error:", err);
        res.status(500).json({ error: "Error occured"});
    }
}

module.exports = { fetchRoomChats, addChat };