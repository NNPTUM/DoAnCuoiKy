const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const Reaction = require("../models/reaction.model");

// THÊM BÌNH LUẬN
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.create({ postId, userId, content });

    // Tăng số lượng comment trong bài viết (Cập nhật nguyên tử)
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "username avatarUrl",
    );

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// THẢ CẢM XÚC (LIKE/LOVE...)
exports.toggleReaction = async (req, res) => {
  try {
    const { targetId } = req.params; // Có thể là PostId hoặc CommentId
    const { type, targetModel } = req.body; // targetModel: 'Post' hoặc 'Comment'
    const userId = req.user.id;

    // Tìm xem đã react chưa
    const existingReaction = await Reaction.findOne({
      userId,
      targetId,
      targetModel,
    });

    if (existingReaction) {
      // Nếu đã react rồi -> Xóa (Unlike)
      await Reaction.findByIdAndDelete(existingReaction._id);
      await mongoose
        .model(targetModel)
        .findByIdAndUpdate(targetId, { $inc: { reactionCount: -1 } });
      return res
        .status(200)
        .json({ success: true, message: "Đã hủy tương tác" });
    }

    // Nếu chưa -> Tạo mới
    await Reaction.create({ userId, targetId, targetModel, type });
    await mongoose
      .model(targetModel)
      .findByIdAndUpdate(targetId, { $inc: { reactionCount: 1 } });

    res.status(201).json({ success: true, message: "Đã tương tác thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
