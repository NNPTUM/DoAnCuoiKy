const express = require("express");
const adminController = require("../controllers/admin.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Tất cả các route dưới đây chỉ "admin" mới được phép gọi
router.use(verifyToken);
router.use(authorizeRoles("admin"));

// Cài đặt hệ thống
router.get("/settings", adminController.getSystemSettings);
router.put("/settings", adminController.updateSystemSettings);

// Quản lý người dùng cấp cao
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/role", adminController.assignRole);
router.delete("/users/:id", adminController.permanentlyDeleteUser);

module.exports = router;
