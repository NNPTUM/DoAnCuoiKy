// server/src/models/comment.model.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // Nếu đây là một câu trả lời cho bình luận khác, lưu ID của bình luận gốc vào đây
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    // Tuỳ chọn: Cho phép đính kèm 1 ảnh vào bình luận
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
