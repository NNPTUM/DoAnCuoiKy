// server/src/models/user_setting.model.js
const mongoose = require("mongoose");

const userSettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Đảm bảo mỗi user chỉ có 1 bảng setting
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    notifications: {
      message: { type: Boolean, default: true },
      friendRequest: { type: Boolean, default: true },
      postTags: { type: Boolean, default: true },
    },
    language: {
      type: String,
      default: "vi", // Tiếng Việt làm mặc định
    },
    privacy: {
      showOnlineStatus: { type: Boolean, default: true }, // Hiện trạng thái "Đang hoạt động"
      whoCanMessageMe: {
        type: String,
        enum: ["everyone", "friends"],
        default: "everyone",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserSetting", userSettingSchema);
