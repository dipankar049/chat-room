const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: String,
  type: { type: String, enum: ["private", "public"], default: "public" },

  // For registered users
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // For guests
  guestOwnerId: { type: String },
  isTemporary: { type: Boolean, default: false },

  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
