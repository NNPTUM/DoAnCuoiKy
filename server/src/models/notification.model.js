// server/src/models/notification.model.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "friend_request",
        "friend_accept",
        "post_like",
        "post_comment",
        "message",
      ],
      required: true,
    },
    // Đường dẫn hoặc ID để khi bấm vào thông báo sẽ chuyển hướng tới đúng bài viết/phòng chat
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String, // VD: "Tài đã bình luận về bài viết của bạn"
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
