const express = require("express");
const moderatorController = require("../controllers/moderator.controller");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Route cho member thường gửi report (Ai đăng nhập cũng gửi được)
router.post("/reports/submit", verifyToken, moderatorController.submitReport);

// Các route thực thi quyền kiểm duyệt (Cả Admin và Moderator đều có quyền)
router.use(verifyToken);
router.use(authorizeRoles("admin", "moderator"));

// Quản lý Report
router.get("/reports", moderatorController.getReports);
router.put("/reports/:id", moderatorController.updateReportStatus);

// Kiểm duyệt tính năng nội dung (Post)
router.put("/posts/:id/moderate", moderatorController.moderatePost);

// Quản lý người dùng (Cảnh cáo user)
router.put("/users/:id/warn", moderatorController.warnUser);

module.exports = router;
