// server/src/models/message.model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"], // 'system': "A đã thêm B vào nhóm"
      default: "text",
    },
    content: {
      type: String, // Chứa text hoặc URL của file/ảnh
      required: true,
      trim: true,
    },
    // Trạng thái thu hồi tin nhắn
    isRecalled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
