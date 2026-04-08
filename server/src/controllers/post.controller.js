const mongoose = require("mongoose");
const Post = require("../models/post.model");
const Media = require("../models/media.model");
const Block = require("../models/block.model");
const SystemSetting = require("../models/system_setting.model");

// LẤY DANH SÁCH BÀI VIẾT (FEED)
exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedLimit = Math.max(
      1,
      Math.min(50, Number.parseInt(limit, 10) || 10),
    );

    const blocks = await Block.find({
      $or: [{ blockerId: userId }, { blockedId: userId }],
    });
    const blockedIds = blocks.map((b) =>
      b.blockerId.toString() === userId
        ? b.blockedId.toString()
        : b.blockerId.toString(),
    );

    const systemSetting = await SystemSetting.findOne()
      .select("algorithms.newsfeedAlgorithm")
      .lean();

    const configuredAlgorithm =
      systemSetting?.algorithms?.newsfeedAlgorithm || "chronological";

    const baseFilter = {
      privacy: "public",
      status: "active",
      userId: { $nin: blockedIds },
    };

    const engagementStatsRows = await Post.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalReactions: { $sum: "$reactionCount" },
          totalComments: { $sum: "$commentCount" },
          engagedPosts: {
            $sum: {
              $cond: [
                {
                  $gt: [{ $add: ["$reactionCount", "$commentCount"] }, 0],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const engagementStats = engagementStatsRows[0] || {
      totalPosts: 0,
      totalReactions: 0,
      totalComments: 0,
      engagedPosts: 0,
    };

    const totalInteractions =
      Number(engagementStats.totalReactions || 0) +
      Number(engagementStats.totalComments || 0);

    const isLowEngagementData =
      Number(engagementStats.totalPosts || 0) < 5 ||
      totalInteractions < 10 ||
      Number(engagementStats.engagedPosts || 0) < 3;

    const fallbackApplied =
      ["engagement", "hybrid"].includes(configuredAlgorithm) &&
      isLowEngagementData;

    const effectiveAlgorithm = fallbackApplied
      ? "chronological"
      : configuredAlgorithm;

    let posts = [];

    if (effectiveAlgorithm === "engagement") {
      posts = await Post.find(baseFilter)
        .populate("userId", "username avatarUrl")
        .populate("mediaIds")
        .sort({
          isPinned: -1,
          reactionCount: -1,
          commentCount: -1,
          createdAt: -1,
        })
        .limit(parsedLimit)
        .skip((parsedPage - 1) * parsedLimit);
    } else if (effectiveAlgorithm === "hybrid") {
      const hybridPosts = await Post.aggregate([
        { $match: baseFilter },
        {
          $addFields: {
            engagementScore: {
              $add: [
                { $multiply: ["$reactionCount", 2] },
                { $multiply: ["$commentCount", 3] },
              ],
            },
            recencyScore: {
              $divide: [
                1,
                {
                  $add: [
                    1,
                    {
                      $divide: [
                        { $subtract: [new Date(), "$createdAt"] },
                        1000 * 60 * 60,
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $addFields: {
            hybridScore: {
              $add: [
                "$engagementScore",
                { $multiply: ["$recencyScore", 100] },
                { $cond: ["$isPinned", 1000, 0] },
              ],
            },
          },
        },
        { $sort: { hybridScore: -1, createdAt: -1 } },
        { $skip: (parsedPage - 1) * parsedLimit },
        { $limit: parsedLimit },
      ]);

      posts = await Post.populate(hybridPosts, [
        { path: "userId", select: "username avatarUrl" },
        { path: "mediaIds" },
      ]);
    } else {
      posts = await Post.find(baseFilter)
        .populate("userId", "username avatarUrl")
        .populate("mediaIds") //Populate ảnh để hiển thị đúng sau reload
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(parsedLimit)
        .skip((parsedPage - 1) * parsedLimit);
    }

    res.status(200).json({
      success: true,
      data: posts,
      meta: {
        configuredAlgorithm,
        effectiveAlgorithm,
        fallbackApplied,
        fallbackReason: fallbackApplied
          ? "Engagement data is not enough yet, temporarily using chronological."
          : null,
        engagementStats: {
          totalPosts: Number(engagementStats.totalPosts || 0),
          totalReactions: Number(engagementStats.totalReactions || 0),
          totalComments: Number(engagementStats.totalComments || 0),
          engagedPosts: Number(engagementStats.engagedPosts || 0),
        },
        page: parsedPage,
        limit: parsedLimit,
      },
    });
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
      const mediaData = media.map((item) => ({
        uploaderId: userId,
        mediaType: "image",
        url: item.url,
        publicId: item.publicId,
      }));
      const savedMedia = await Media.insertMany(mediaData);
      mediaIds = savedMedia.map((m) => m._id);
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
      .populate("userId", "username avatarUrl")
      .populate("mediaIds");

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
      { returnDocument: "after" }, //Không dùng new: true (deprecated)
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
