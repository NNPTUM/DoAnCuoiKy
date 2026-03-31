// server/src/models/conversation.model.js
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      trim: true, // Chỉ dùng nếu là group chat
    },
    avatarUrl: {
      type: String, // Ảnh đại diện của group
    },
    // Lưu tạm văn bản gần nhất để hiển thị ra ngoài list
    lastMessage: {
      type: String,
    },
    // Dùng để hiển thị dòng text tin nhắn mới nhất ngoài danh sách chat
    latestMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Conversation", conversationSchema);
