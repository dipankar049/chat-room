const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true },
    senderName: { type: String, required: true },
    senderId: { type: String },
    text: { type: String, required: true },
    system: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ["sending", "sent", "delivered", "failed"],
      default: "sent"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);