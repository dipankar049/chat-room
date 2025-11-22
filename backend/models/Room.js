const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: String,
  type: { type: String, enum: ["private", "public"], default: "public" },

  // For registered users
  owner: { type: String, required: true },
  ownerName: String,

  members: [{ userId: String, username: String }],
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
