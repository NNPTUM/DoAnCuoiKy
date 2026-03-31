const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/:conversationId", verifyToken, messageController.getMessages);
router.post("/", verifyToken, messageController.sendMessage);
router.patch("/recall/:messageId", verifyToken, messageController.recallMessage);
router.patch("/edit/:messageId", verifyToken, messageController.editMessage);

module.exports = router;
