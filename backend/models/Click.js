import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // reference to User collection
      ref: "User",
      required: true,
    },
    notificationId: {
      type: String, // comes from your FCM payload (remoteMessage.data.notificationId)
      required: true,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

export default mongoose.model("Click", clickSchema);
