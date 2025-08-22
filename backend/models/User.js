const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  createdRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
