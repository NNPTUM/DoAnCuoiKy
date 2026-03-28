// server/src/routes/upload.route.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary.config');
const { verifyToken } = require('../middlewares/auth.middleware');

// Dùng memoryStorage - giữ file trong RAM rồi stream thẳng lên Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  },
});

// Endpoint nhận 1 file ảnh (field name là 'image')
router.post('/image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file nào được upload' });
    }

    // Upload buffer lên Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'social_app_posts',
          transformation: [{ width: 800, height: 600, crop: 'limit' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      message: 'Upload ảnh thành công',
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;