// server/src/models/friend_request.model.js
const mongoose = require("mongoose");
const {
  FRIEND_REQUEST_STATUS,
  FRIEND_REQUEST_STATUS_VALUES,
} = require("../utils/friend-request-status.util");

const friendRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: FRIEND_REQUEST_STATUS_VALUES,
      default: FRIEND_REQUEST_STATUS.PENDING,
    },
  },
  { timestamps: true },
);

// Tránh việc 1 người gửi liên tục nhiều lời mời cho cùng 1 người
friendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model("FriendRequest", friendRequestSchema);
