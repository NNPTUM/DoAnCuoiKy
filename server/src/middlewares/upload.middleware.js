const multer = require("multer");

const createImageUpload = ({ maxMb = 5 } = {}) => {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype && file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Chỉ cho phép upload file ảnh!"), false);
      }
    },
  });
};

module.exports = {
  createImageUpload,
};
