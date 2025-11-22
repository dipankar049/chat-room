const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  uid: String,
  password: { type: String },
  createdRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  profilePhoto_url: String,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
