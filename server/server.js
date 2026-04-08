// server/server.js
require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db.config");
const authRoutes = require("./src/routes/auth.route");
const postRoutes = require("./src/routes/post.route");
const uploadRoutes = require("./src/routes/upload.route");
const connectionRoutes = require("./src/routes/connection.route");
const conversationRoutes = require("./src/routes/conversation.route");
const messageRoutes = require("./src/routes/message.route");
const settingRoutes = require("./src/routes/setting.route");
const adminRoutes = require("./src/routes/admin.route");
const moderatorRoutes = require("./src/routes/moderator.route");
const { initSocket } = require("./src/socket/socket");
const { errorHandler } = require("./src/middlewares/error.middleware");
require("./src/models");

// Khởi tạo app Express
const app = express();
// Tạo server HTTP từ Express app
const server = http.createServer(app);

// Middleware
app.use(cors()); // Cho phép Frontend (Vite) gọi API không bị lỗi CORS
app.use(express.json()); // Giúp Backend đọc được dữ liệu JSON từ Frontend gửi lên
app.use("/api/auth", authRoutes); // Đăng ký route cho auth (đăng ký, đăng nhập)
app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/moderator", moderatorRoutes);

// Tạo một API test thử
app.get("/", (req, res) => {
  res.json({
    message: "Chào mừng đến với Backend Mạng Xã Hội Chat Real-time!",
  });
});

app.use(errorHandler);

initSocket(server);

// Kết nối database trước khi khởi động server
connectDB();

// Khai báo Port và chạy Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server đang chạy thành công tại http://localhost:${PORT}`);
  console.log(`LAN access: http://172.168.10.123:${PORT}`);
});
