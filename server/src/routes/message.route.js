const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { createImageUpload } = require("../middlewares/upload.middleware");
const asyncHandler = require("../utils/asyncHandler");

const upload = createImageUpload({ maxMb: 10 });

router.get(
  "/:conversationId",
  verifyToken,
  asyncHandler(messageController.getMessages),
);
router.post("/", verifyToken, asyncHandler(messageController.sendMessage));
router.post(
  "/upload-image",
  verifyToken,
  upload.single("image"),
  asyncHandler(messageController.uploadMessageImage),
);
router.patch(
  "/recall/:messageId",
  verifyToken,
  asyncHandler(messageController.recallMessage),
);
router.patch(
  "/edit/:messageId",
  verifyToken,
  asyncHandler(messageController.editMessage),
);

module.exports = router;
