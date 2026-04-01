const SystemSetting = require("../models/system_setting.model");
const User = require("../models/user.model");
const Role = require("../models/role.model");

const sanitizeSettingsPayload = (payload = {}) => {
  const features = payload.features || {};
  const algorithms = payload.algorithms || {};
  const ads = payload.ads || {};

  return {
    features: {
      isLivestreamEnabled: Boolean(features.isLivestreamEnabled),
      isStoryEnabled: Boolean(features.isStoryEnabled),
      isImageCommentEnabled: Boolean(features.isImageCommentEnabled),
      isRegistrationEnabled: Boolean(features.isRegistrationEnabled),
    },
    algorithms: {
      newsfeedAlgorithm: ["chronological", "engagement", "hybrid"].includes(
        algorithms.newsfeedAlgorithm,
      )
        ? algorithms.newsfeedAlgorithm
        : "chronological",
      friendSuggestionLimit: Math.max(
        1,
        Number.parseInt(algorithms.friendSuggestionLimit, 10) || 10,
      ),
    },
    ads: {
      isAdsEnabled: Boolean(ads.isAdsEnabled),
    },
  };
};

// GET /api/admin/settings
const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({
        lastUpdatedBy: req.user.id,
      });
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Lỗi getSystemSettings:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/admin/settings
const updateSystemSettings = async (req, res) => {
  try {
    const updates = sanitizeSettingsPayload(req.body || {});

    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting(updates);
    } else {
      settings.features = {
        ...settings.features.toObject(),
        ...updates.features,
      };
      settings.algorithms = {
        ...settings.algorithms.toObject(),
        ...updates.algorithms,
      };
      settings.ads = { ...settings.ads.toObject(), ...updates.ads };
    }

    settings.lastUpdatedBy = req.user.id;
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật cài đặt thành công",
      data: settings,
    });
  } catch (error) {
    console.error("Lỗi updateSystemSettings:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .populate("roleId", "name")
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi getAllUsers:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/admin/users/:id/role
// Cấp quyền User -> Moderator hoặc ngược lại
const assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const requestedRoleName = (req.body?.roleName || "")
      .toString()
      .toLowerCase();

    if (!requestedRoleName) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu roleName" });
    }

    const role = await Role.findOne({ name: requestedRoleName });
    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: "Role không hợp lệ" });
    }

    const targetUser = await User.findById(id).populate("roleId", "name");
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    const isSelfAction = String(req.user.id) === String(targetUser._id);
    if (isSelfAction && requestedRoleName !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể tự hạ quyền của chính mình.",
      });
    }

    if (targetUser.roleId?.name === "admin" && requestedRoleName !== "admin") {
      const adminCount = await User.countDocuments({
        roleId: targetUser.roleId._id,
      });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Hệ thống cần tối thiểu 1 tài khoản admin.",
        });
      }
    }

    if (String(targetUser.roleId?._id) === String(role._id)) {
      return res.status(200).json({
        success: true,
        message: "Không có thay đổi quyền.",
        data: targetUser,
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { roleId: role._id },
      { new: true },
    )
      .select("-password")
      .populate("roleId", "name");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật quyền thành công!",
      data: user,
    });
  } catch (error) {
    console.error("Lỗi assignRole:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/admin/users/:id
// Xóa vĩnh viễn user (Quyền tối thượng)
const permanentlyDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await User.findById(id).populate("roleId", "name");
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    if (String(targetUser._id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể tự xóa chính tài khoản admin đang đăng nhập.",
      });
    }

    if (targetUser.roleId?.name === "admin") {
      const adminCount = await User.countDocuments({
        roleId: targetUser.roleId._id,
      });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Không thể xóa admin cuối cùng của hệ thống.",
        });
      }
    }

    // Nếu không muốn xóa vật lý, bạn có thể xóa Post, Comment liên quan trước ở đây

    const deletedUser = await User.findByIdAndDelete(targetUser._id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa vĩnh viễn tài khoản và dữ liệu liên quan",
    });
  } catch (error) {
    console.error("Lỗi permanentlyDeleteUser:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  getAllUsers,
  assignRole,
  permanentlyDeleteUser,
};
