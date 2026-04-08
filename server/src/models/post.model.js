// server/src/models/post.model.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    // Chế độ hiển thị bài viết
    privacy: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    // Mảng chứa ID của các hình ảnh/video đính kèm
    mediaIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
      },
    ],
    // Mảng chứa ID của các hashtag được dùng trong bài
    hashtagIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hashtag",
      },
    ],
    // Lưu sẵn số lượng để Frontend hiển thị nhanh mà không cần đếm lại toàn bộ bảng Comment/Reaction
    commentCount: { type: Number, default: 0 },
    reactionCount: { type: Number, default: 0 },

    // Dành cho Moderator: Ghim bài viết quan trọng
    isPinned: {
      type: Boolean,
      default: false,
    },
    // Dành cho Moderator: Phân loại nội dung
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Trạng thái bài viết để kiểm duyệt
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
