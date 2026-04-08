const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Thiếu token xác thực",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

// Middleware phân quyền dựa trên danh sách role được phép
const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message:
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
        });
      }

      // Lấy user từ DB và populate bảng Role để lấy tên của role
      const user = await User.findById(req.user.id).populate("roleId");

      if (!user || !user.roleId) {
        return res.status(403).json({
          success: false,
          message: "Tài khoản không tồn tại hoặc chưa được cấp quyền.",
        });
      }

      // Kiểm tra xem name của role có nằm trong danh sách truyền vào không
      if (!allowedRoles.includes(user.roleId.name)) {
        return res.status(403).json({
          success: false, // 403 Forbidden
          message: `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${allowedRoles.join(", ")}`,
        });
      }

      // Gán thêm thông tin role vào request nếu cần dùng ở controller
      req.user.role = user.roleId.name;
      next();
    } catch (error) {
      console.error("Lỗi xác thực quyền:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi Server khi xác thực quyền",
      });
    }
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
