// server/src/models/block.model.js
const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    blockerId: {
      // Người thực hiện chặn
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedId: {
      // Người bị chặn
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String, // Lý do chặn (spam, quấy rối...)
      trim: true,
    },
  },
  { timestamps: true },
);

blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

module.exports = mongoose.model("Block", blockSchema);
