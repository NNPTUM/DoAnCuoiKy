const mongoose = require("mongoose");
const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const Reaction = require("../models/reaction.model");
const { findCommentsByPost } = require("../utils/comment.util");

// --- CHỨC NĂNG BÌNH LUẬN ---
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // 1. Tạo bình luận mới
    const comment = await Comment.create({ postId, userId, content });

    // 2. Tăng số lượng commentCount ở bảng Post
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // 3. Lấy lại thông tin đầy đủ của người comment để trả về FE
    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "username avatarUrl",
    );

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- CHỨC NĂNG THẢ CẢM XÚC (LIKE) ---
exports.toggleReaction = async (req, res) => {
  try {
    const { targetId } = req.params; // ID của Post hoặc Comment
    const { type, targetModel } = req.body; // targetModel: 'Post' hoặc 'Comment'
    const userId = req.user.id;

    // Kiểm tra xem user này đã react vào đối tượng này chưa
    const existingReaction = await Reaction.findOne({
      userId,
      targetId,
      targetModel,
    });

    if (existingReaction) {
      // Nếu ĐÃ CÓ -> Xóa (Unlike)
      await Reaction.findByIdAndDelete(existingReaction._id);
      await mongoose
        .model(targetModel)
        .findByIdAndUpdate(targetId, { $inc: { reactionCount: -1 } });
      return res
        .status(200)
        .json({ success: true, message: "Unreacted", isReacted: false });
    } else {
      // Nếu CHƯA CÓ -> Tạo mới
      await Reaction.create({
        userId,
        targetId,
        targetModel,
        type: type || "like",
      });
      await mongoose
        .model(targetModel)
        .findByIdAndUpdate(targetId, { $inc: { reactionCount: 1 } });
      return res
        .status(201)
        .json({ success: true, message: "Reacted", isReacted: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách posts mà user hiện tại đã like
exports.getMyPostReactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy tất cả reactions của user trên Post
    const reactions = await Reaction.find({
      userId,
      targetModel: "Post",
    }).select("targetId");

    // Chuyển thành mảng của postIds
    const likedPostIds = reactions.map((r) => r.targetId.toString());

    res.status(200).json({ success: true, data: likedPostIds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await findCommentsByPost(Comment, postId);

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bình luận" });
    }

    if (comment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền sửa bình luận này" });
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await Comment.findById(commentId).populate(
      "userId",
      "username avatarUrl",
    );

    res.status(200).json({ success: true, data: updatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bình luận" });
    }

    if (comment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền xóa bình luận này" });
    }

    await Comment.findByIdAndDelete(commentId);

    // Giảm số lượng commentCount ở bảng Post
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });

    res.status(200).json({ success: true, message: "Đã xóa bình luận" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
