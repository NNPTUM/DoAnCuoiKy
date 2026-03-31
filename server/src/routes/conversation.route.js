const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversation.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, conversationController.getConversations);
router.post("/", verifyToken, conversationController.createOrGetConversation);

module.exports = router;
