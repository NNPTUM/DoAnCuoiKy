const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const interactionController = require("../controllers/interaction.controller");
const { verifyToken } = require("../middlewares/auth.middleware"); // Middleware bảo vệ

// Route cho bài viết
router.get("/", verifyToken, postController.getAllPosts);
router.post("/", verifyToken, postController.createPost);

// Route cho tương tác (Comment & Reaction)
router.post("/:postId/comments", verifyToken, interactionController.addComment);
router.post(
  "/:targetId/react",
  verifyToken,
  interactionController.toggleReaction,
);

module.exports = router;
