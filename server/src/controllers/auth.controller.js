const User = require("../models/user.model");
const Role = require("../models/role.model");
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
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: { user, token },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
