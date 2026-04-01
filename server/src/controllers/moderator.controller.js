const Report = require("../models/report.model");
const Post = require("../models/post.model");
const User = require("../models/user.model");

// GET /api/moderator/reports
const getReports = async (req, res) => {
  try {
    const { status } = req.query; // pending, reviewing, resolved
    const filter = {};
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate("reporterId", "username avatarUrl")
      .populate("resolvedBy", "username")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Lỗi getReports:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/moderator/reports/:id
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status,
        resolutionNote,
        resolvedBy: req.user.id,
      },
      { new: true },
    );

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy báo cáo" });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Đã cập nhật trạng thái báo cáo",
        data: report,
      });
  } catch (error) {
    console.error("Lỗi updateReportStatus:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/moderator/posts/:id/moderate
// Gỡ bài viết hoặc ghim bài viết
const moderatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isPinned, tags } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status; // active, hidden, deleted
    if (isPinned !== undefined) updates.isPinned = isPinned;
    if (tags !== undefined) updates.tags = tags;

    const post = await Post.findByIdAndUpdate(id, updates, { new: true });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài viết" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Đã kiểm duyệt bài viết", data: post });
  } catch (error) {
    console.error("Lỗi moderatePost:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/moderator/users/:id/warn
const warnUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    user.warningCount += 1;
    // Nếu bị cảnh cáo 3 lần -> khóa tài khoản tự động (banned)
    if (user.warningCount >= 3) {
      user.status = "banned";
      user.isActive = false; // block login
    } else {
      user.status = "warned";
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Đã cảnh cáo người dùng. Số lần cảnh cáo: ${user.warningCount}`,
      data: user,
    });
  } catch (error) {
    console.error("Lỗi warnUser:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/moderator/reports
// (Tạm để User end-point tạo report vào đây, hoặc bạn có thể tách ra user.route)
const submitReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    const report = new Report({
      reporterId: req.user.id,
      targetType,
      targetId,
      reason,
      description,
    });

    await report.save();
    return res
      .status(201)
      .json({
        success: true,
        message: "Đã gửi báo cáo thành công",
        data: report,
      });
  } catch (error) {
    console.error("Lỗi submitReport:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  getReports,
  updateReportStatus,
  moderatePost,
  warnUser,
  submitReport,
};
