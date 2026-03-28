// server/src/models/role.model.js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["user", "admin", "moderator"], // Giới hạn các quyền hợp lệ
      default: "user",
    },
    description: {
      type: String,
      default: "Người dùng tiêu chuẩn của hệ thống",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Role", roleSchema);
