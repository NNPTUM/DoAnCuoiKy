// server/src/socket/socket.js
const { Server } = require("socket.io");

let onlineUsers = [];

// Hàm thêm user vào danh sách online
const addUser = (userId, socketId) => {
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};

// Hàm xóa user khi ngắt kết nối
const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

// Hàm lấy thông tin socket của một user cụ thể
const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // URL của Frontend React
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Một người dùng kết nối:", socket.id);

    // 1. Lắng nghe user đăng nhập và lưu lại
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getOnlineUsers", onlineUsers); // Gửi danh sách online cho mọi người
    });

    // 2. Lắng nghe sự kiện Gửi tin nhắn
    socket.on("sendMessage", ({ senderId, receiverId, text, messageData }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit("getMessage", messageData);
      }
    });

    // 3.a Lắng nghe sự kiện Thu hồi tin nhắn
    socket.on("recallMessage", ({ messageId, conversationId, receiverId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit("messageRecalled", { messageId, conversationId });
      }
    });

    // 3.b Lắng nghe sự kiện Sửa tin nhắn
    socket.on("editMessage", ({ messageId, newText, receiverId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit("messageEdited", { messageId, newText });
      }
    });

    // 4. Xử lý ngắt kết nối
    socket.on("disconnect", () => {
      console.log("Một người dùng ngắt kết nối!");
      removeUser(socket.id);
      io.emit("getOnlineUsers", onlineUsers);
    });
  });
};

module.exports = { initSocket };
