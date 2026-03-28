const Post = require("../models/post.model");

// LẤY DANH SÁCH BÀI VIẾT (FEED)
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ privacy: "public" })
      .populate("userId", "username avatarUrl") // Lấy thông tin người đăng
      .sort({ createdAt: -1 }) // Mới nhất lên đầu
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
    const { content, privacy, mediaIds } = req.body;
    const userId = req.user.id; // Lấy từ Middleware xác thực (sẽ viết ở bước sau)

    const newPost = await Post.create({
      userId,
      content,
      privacy: privacy || "public",
      mediaIds: mediaIds || [],
    });

    // Populate thông tin user để trả về FE hiển thị ngay
    const populatedPost = await Post.findById(newPost._id).populate(
      "userId",
      "username avatarUrl",
    );

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
