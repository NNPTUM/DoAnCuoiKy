const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    // Người gửi report (User)
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Đối tượng bị report (có thể là Post, User, Comment...)
    targetType: {
      type: String,
      enum: ["Post", "User", "Comment", "Message"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Lý do report
    reason: {
      type: String,
      enum: [
        "spam",
        "hate_speech",
        "nudity",
        "violence",
        "harassment",
        "false_information",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    // Trạng thái xử lý của report (dành cho Moderator)
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending",
    },
    // Moderator xử lý report này
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Ghi chú của Moderator khi xử lý xong
    resolutionNote: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
