const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connection.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Các thao tác liên quan đến Lời mời kết bạn
router.post("/requests", verifyToken, connectionController.sendFriendRequest);
router.get(
  "/requests/pending",
  verifyToken,
  connectionController.getPendingRequests,
);
router.get("/requests/sent", verifyToken, connectionController.getSentRequests);
router.get(
  "/status/:targetId",
  verifyToken,
  connectionController.getFriendStatus,
);
router.put(
  "/requests/:requestId/accept",
  verifyToken,
  connectionController.acceptFriendRequest,
);
router.put(
  "/requests/:requestId/decline",
  verifyToken,
  connectionController.declineFriendRequest,
);

// Thao tác Hủy kết bạn
router.delete(
  "/unfriend/:friendId",
  verifyToken,
  connectionController.unfriend,
);

// Thao tác Chặn
router.get("/blocks", verifyToken, connectionController.getBlockedUsers);
router.post("/block", verifyToken, connectionController.blockUser);
router.delete(
  "/block/:blockedId",
  verifyToken,
  connectionController.unblockUser,
);

// Lấy danh sách
router.get("/friends", verifyToken, connectionController.getFriends);
router.get("/suggestions", verifyToken, connectionController.getSuggestions);
module.exports = router;
