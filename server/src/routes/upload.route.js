// server/src/routes/upload.route.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { createImageUpload } = require("../middlewares/upload.middleware");
const { uploadImageBuffer } = require("../services/cloudinary.service");
const asyncHandler = require("../utils/asyncHandler");

const upload = createImageUpload({ maxMb: 5 });

// Endpoint nhận 1 file ảnh (field name là 'image')
router.post(
  "/image",
  verifyToken,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Không có file nào được upload" });
    }

    const result = await uploadImageBuffer(req.file.buffer, {
      folder: "social_app_posts",
      transformation: [{ width: 800, height: 600, crop: "limit" }],
    });

    res.status(200).json({
      success: true,
      message: "Upload ảnh thành công",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  }),
);

module.exports = router;
