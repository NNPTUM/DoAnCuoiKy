// server/src/models/reaction.model.js
const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ID của bài viết HOẶC ID của bình luận
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel", // Chỉ định tham chiếu động
    },
    // Xác định xem targetId ở trên là của bảng Post hay bảng Comment
    targetModel: {
      type: String,
      required: true,
      enum: ["Post", "Comment"],
    },
    type: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      default: "like",
    },
  },
  { timestamps: true },
);

// Đảm bảo 1 user chỉ có 1 reaction trên 1 target (tránh 1 người like 2 lần)
reactionSchema.index(
  { userId: 1, targetId: 1, targetModel: 1 },
  { unique: true },
);

module.exports = mongoose.model("Reaction", reactionSchema);
