// server/src/models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true, // Chuỗi mã hóa (hashed) từ bcrypt
    },
    avatarUrl: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    bio: {
      type: String,
      maxlength: 160,
      default: "",
    },
    // Tham chiếu (1-N) tới bảng Role
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Dùng để khóa tài khoản (ban user) thay vì xóa hẳn khỏi DB
    },
    // Trạng thái tài khoản chi tiết hơn cho Moderator
    status: {
      type: String,
      enum: ["active", "warned", "banned"],
      default: "active",
    },
    // Chứa số lần bị cảnh báo
    warningCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
