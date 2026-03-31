const User = require("../models/user.model");
const Role = require("../models/role.model");
const Token = require("../models/token.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ĐĂNG KÝ
exports.register = async (req, res) => {
  try {
    const { username, email, password, roleId } = req.body;

    // 1. Kiểm tra user tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại" });

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Xác định Role hợp lệ
    let resolvedRoleId = roleId;
    if (!resolvedRoleId) {
      const defaultRole = await Role.findOne({ name: "user" }).select("_id");
      if (!defaultRole) {
        return res.status(500).json({
          success: false,
          message: "Thiếu dữ liệu Role mặc định. Vui lòng seed Role trước.",
        });
      }
      resolvedRoleId = defaultRole._id;
    }

    // 4. Lưu vào DB
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      roleId: resolvedRoleId,
    });

    res
      .status(201)
      .json({ success: true, message: "Đăng ký thành công", data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ĐĂNG NHẬP (Trả về JWT)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu không chính xác" });

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret_key_cua_tai", // Lấy từ .env
      { expiresIn: "10d" },
    );

    // 4. Tạo Refresh Token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET || "refresh_secret_cua_tai",
      { expiresIn: "30d" }
    );

    // 5. Lưu vào bảng Token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Lưu 30 ngày

    await Token.create({
      userId: user._id,
      refreshToken: refreshToken,
      deviceInfo: req.headers["user-agent"] || "Unknown Device",
      ipAddress: req.ip || "Unknown IP",
      expiresAt: expiresAt,
    });

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: { user, token, refreshToken },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thông tin user từ token
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("roleId", "name description");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật thông tin profile của user đang đăng nhập
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, bio, avatarUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl })
      },
      { returnDocument: 'after' }
    ).select("-password -roleId");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      data: updatedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
       return res.status(400).json({ success: false, message: "Tên người dùng đã được sử dụng" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Lấy thông tin profile của một user khác theo ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password -roleId -email");
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Tìm kiếm người dùng
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }
    const currentUserId = req.user?.id;

    // Build the query to find users matching the username and exclude the current user
    const query = { username: { $regex: q, $options: "i" } };
    if (currentUserId) query._id = { $ne: currentUserId };

    const users = await User.find(query)
      .select("_id username avatarUrl")
      .limit(10);

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
