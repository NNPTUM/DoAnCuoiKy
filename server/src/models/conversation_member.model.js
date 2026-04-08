// server/src/models/conversation_member.model.js
const mongoose = require("mongoose");

const conversationMemberSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["member", "admin"], // Quản trị viên của group chat
      default: "member",
    },
    // Mấu chốt cho tính năng "Seen": Lưu lại ID của tin nhắn cuối cùng user này đã đọc
    lastReadMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true },
);

conversationMemberSchema.index(
  { conversationId: 1, userId: 1 },
  { unique: true },
);

module.exports = mongoose.model("ConversationMember", conversationMemberSchema);
