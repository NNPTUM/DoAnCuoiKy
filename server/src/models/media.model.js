// server/src/models/media.model.js
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true, // Link ảnh trực tiếp
    },
    publicId: {
      type: String,
      required: true, // ID trả về từ Cloudinary để sau này gọi API xóa ảnh
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "document"],
      default: "image",
    },
    format: String, // VD: 'jpg', 'png', 'mp4'
    sizeBytes: Number, // Dung lượng file
  },
  { timestamps: true },
);

module.exports = mongoose.model("Media", mediaSchema);
