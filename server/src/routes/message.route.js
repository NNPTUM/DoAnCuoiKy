const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Chỉ cho phép tải ảnh lên!"), false);
  },
});

router.get("/:conversationId", verifyToken, messageController.getMessages);
router.post("/", verifyToken, messageController.sendMessage);
router.post("/upload-image", verifyToken, upload.single("image"), messageController.uploadMessageImage);
router.patch("/recall/:messageId", verifyToken, messageController.recallMessage);
router.patch("/edit/:messageId", verifyToken, messageController.editMessage);

module.exports = router;
