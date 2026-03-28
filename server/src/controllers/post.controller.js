const mongoose = require("mongoose");
const Post = require("../models/post.model");
const Media = require("../models/media.model");
const Comment = require("../models/comment.model"); // optional but prevents potential ReferenceError below
const Block = require("../models/block.model");

// LẤY DANH SÁCH BÀI VIẾT (FEED)
exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const blocks = await Block.find({
      $or: [{ blockerId: userId }, { blockedId: userId }],
    });
    const blockedIds = blocks.map((b) =>
      b.blockerId.toString() === userId ? b.blockedId.toString() : b.blockerId.toString()
    );

    const posts = await Post.find({
      privacy: "public",
      userId: { $nin: blockedIds },
    })
      .populate("userId", "username avatarUrl")
      .populate("mediaIds") //Populate ảnh để hiển thị đúng sau reload
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TẠO BÀI VIẾT MỚI
exports.createPost = async (req, res) => {
  try {
    const { content, privacy, media } = req.body;
    const userId = req.user.id;

    let mediaIds = [];

    // 1. Nếu có ảnh, lưu vào bảng Media trước
    if (media && media.length > 0) {
      const mediaData = media.map(item => ({
        uploaderId: userId,
        mediaType: 'image',
        url: item.url,
        publicId: item.publicId,
      }));
      const savedMedia = await Media.insertMany(mediaData);
      mediaIds = savedMedia.map(m => m._id);
    }

    // 2. Tạo bài viết
    const newPost = await Post.create({
      userId,
      content,
      privacy: privacy || "public",
      mediaIds,
    });

    // 3. Populate để trả về FE
    const populatedPost = await Post.findById(newPost._id)
      .populate('userId', 'username avatarUrl')
      .populate('mediaIds');

    res.status(201).json({ success: true, data: populatedPost });

  } catch (error) {
    console.error("createPost error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// LẤY DANH SÁCH BÀI VIẾT CỦA BẢN THÂN
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await Post.find({ userId })
      .populate("userId", "username avatarUrl")
      .populate("mediaIds") // ✅ Populate ảnh
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LẤY DANH SÁCH BÀI VIẾT PUBLIC CỦA MỘT USER KHÁC
exports.getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId, privacy: "public" })
      .populate("userId", "username avatarUrl")
      .populate("mediaIds")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CẬP NHẬT BÀI VIẾT
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, privacy } = req.body;
    const userId = req.user.id;

    // Tìm và kiểm tra quyền sở hữu trước khi sửa
    const post = await Post.findOne({ _id: id, userId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết hoặc bạn không có quyền sửa",
      });
    }

    // Chỉ cập nhật content và privacy, GIỮ NGUYÊN mediaIds
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { content, privacy },
      { returnDocument: 'after' }, //Không dùng new: true (deprecated)
    )
      .populate("userId", "username avatarUrl")
      .populate("mediaIds"); //Populate ảnh để FE hiển thị đúng

    res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// XÓA BÀI VIẾT
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Chỉ cho phép xóa nếu đúng là chủ bài viết
    const post = await Post.findOneAndDelete({ _id: id, userId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết hoặc bạn không có quyền xóa",
      });
    }

    // (Tùy chọn) Xóa luôn các Comment và Reaction liên quan đến bài viết này
    // await Comment.deleteMany({ postId: id });
    // await Reaction.deleteMany({ targetId: id });

    res
      .status(200)
      .json({ success: true, message: "Đã xóa bài viết thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId })
      .populate("userId", "username avatarUrl") // Lấy thông tin người bình luận
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
