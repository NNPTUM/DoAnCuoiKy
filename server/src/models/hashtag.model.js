// server/src/models/hashtag.model.js
const mongoose = require("mongoose");

const hashtagSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Đảm bảo #HUTECH và #hutech là một
    },
    // Đếm số lượng bài viết dùng tag này để xếp hạng trending
    postCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Hashtag", hashtagSchema);
