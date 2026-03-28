// server/src/models/friendship.model.js
const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema(
  {
    // Lưu ID của 2 người dùng. Khi query bạn bè của User A, chỉ cần tìm mảng users có chứa ID của A.
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }, // createdAt ở đây chính là ngày kỉ niệm kết bạn
);

module.exports = mongoose.model("Friendship", friendshipSchema);
