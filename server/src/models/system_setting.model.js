const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    // ID cố định hoặc chỉ có duy nhất 1 document trong collection này
    // Các công tắc bật tắt tính năng
    features: {
      isLivestreamEnabled: { type: Boolean, default: true },
      isStoryEnabled: { type: Boolean, default: true },
      isImageCommentEnabled: { type: Boolean, default: true },
      isRegistrationEnabled: { type: Boolean, default: true },
    },
    // Thuật toán / Gợi ý
    algorithms: {
      newsfeedAlgorithm: {
        type: String,
        enum: ["chronological", "engagement", "hybrid"],
        default: "chronological",
      },
      friendSuggestionLimit: { type: Number, default: 10 },
    },
    // Quản lý quảng cáo chung
    ads: {
      isAdsEnabled: { type: Boolean, default: false },
    },
    // Lưu lại ID của admin chỉnh sửa lần cuối cùng
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
