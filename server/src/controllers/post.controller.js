const Post = require("../models/post.model");

exports.getAllPosts = async (req, res) => {
  try {
    // Lấy bài viết, sắp xếp mới nhất lên đầu
    // populate('userId') để lấy username và avatar của người đăng
    const posts = await Post.find()
      .populate("userId", "username avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
