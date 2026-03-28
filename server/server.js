// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db.config");
const authRoutes = require("./src/routes/auth.route");
const postRoutes = require("./src/routes/post.route");
require("./src/models");

// Khởi tạo app Express
const app = express();

// Middleware
app.use(cors()); // Cho phép Frontend (Vite) gọi API không bị lỗi CORS
app.use(express.json()); // Giúp Backend đọc được dữ liệu JSON từ Frontend gửi lên
app.use("/api/auth", authRoutes); // Đăng ký route cho auth (đăng ký, đăng nhập)
app.use("/api/posts", postRoutes);

// Tạo một API test thử
app.get("/", (req, res) => {
  res.json({
    message: "Chào mừng đến với Backend Mạng Xã Hội Chat Real-time!",
  });
});

// Kết nối database trước khi khởi động server
connectDB();

// Khai báo Port và chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy thành công tại http://localhost:${PORT}`);
});
