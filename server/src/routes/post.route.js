const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const interactionController = require("../controllers/interaction.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Route cho bài viết
router.get("/", verifyToken, postController.getAllPosts);
router.post("/", verifyToken, postController.createPost);
router.get("/me", verifyToken, postController.getMyPosts); // Lấy bài viết của tôi
router.get("/user/:userId", verifyToken, postController.getPostsByUser); // Lấy bài viết của user khác

router.get(
  "/reactions/my-posts",
  verifyToken,
  interactionController.getMyPostReactions,
); // Lấy danh sách posts đã like

router.put("/:id", verifyToken, postController.updatePost); // Sửa bài viết
router.delete("/:id", verifyToken, postController.deletePost); // Xóa bài viết

// Route cho tương tác (Comment & Reaction)
router.post("/:postId/comments", verifyToken, interactionController.addComment);
router.post(
  "/:targetId/react",
  verifyToken,
  interactionController.toggleReaction,
);
router.get(
  "/:postId/comments",
  verifyToken,
  interactionController.getCommentsByPost,
);
router.put(
  "/:postId/comments/:commentId",
  verifyToken,
  interactionController.updateComment,
);
router.delete(
  "/:postId/comments/:commentId",
  verifyToken,
  interactionController.deleteComment,
);

module.exports = router;
