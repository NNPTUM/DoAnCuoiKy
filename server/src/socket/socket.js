// server/src/socket/socket.js
const { Server } = require("socket.io");
const UserSetting = require("../models/user_setting.model"); // Cần check setting quyền riêng tư

let onlineUsers = [];
let ioInstance = null; // Biến toàn cục giữ instance socket

// Hàm thêm user vào danh sách online (nếu user cho phép hiển thị)
const addUser = async (userId, socketId) => {
  try {
    const setting = await UserSetting.findOne({ userId });
    let isHidden = false;
    if (setting && setting.privacy && setting.privacy.showOnlineStatus === false) {
      isHidden = true;
    }
    
    // Kiểm tra xem socket thực sự còn đang kết nối không trước khi add vào (tránh race condition với ngắt kết nối)
    if (ioInstance && !ioInstance.sockets.sockets.has(socketId)) {
       console.log(`⚠️ Socket ${socketId} đã ngắt kết nối trước khi addUser hoàn thành. Bỏ qua.`);
       return;
    }

    const existingUser = onlineUsers.find((user) => user.userId === userId);
    if (existingUser) {
      existingUser.socketId = socketId;
      existingUser.isHidden = isHidden;
    } else {
      onlineUsers.push({ userId, socketId, isHidden });
    }
  } catch(error) {
    if (ioInstance && !ioInstance.sockets.sockets.has(socketId)) return;
    const existingUser = onlineUsers.find((user) => user.userId === userId);
    if (existingUser) {
      existingUser.socketId = socketId;
      existingUser.isHidden = false;
    } else {
      onlineUsers.push({ userId, socketId, isHidden: false });
    }
  }
};

// Hàm xóa user khi ngắt kết nối
const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

// Hàm lấy thông tin socket của một user cụ thể để gửi thông báo
const getUser = (userId) => {
  if (!userId) return undefined;
  return onlineUsers.find((user) => user.userId.toString() === userId.toString());
};

// Hàm trả về io instance cho các controller khác gọi
const getIo = () => {
  return ioInstance;
};

const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: "*", // Cho phép mọi origin chạy để test nhiều IP khác nhau
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("⚡ Một người dùng kết nối:", socket.id);

    // 1. Lắng nghe user đăng nhập và lưu lại
    socket.on("addUser", async (userId) => {
      await addUser(userId, socket.id);
      console.log(`✅ addUser: ${userId} -> socketId: ${socket.id}`);
      console.log("📋 onlineUsers hiện tại:", onlineUsers.map(u => `${u.userId}:${u.socketId}`));
      
      // Chỉ gửi những user đang public trạng thái online
      const publicUsers = onlineUsers.filter(u => !u.isHidden);
      ioInstance.emit("getOnlineUsers", publicUsers);
    });

    // 2. Lắng nghe sự kiện Gửi tin nhắn
    socket.on("sendMessage", async ({ senderId, receiverId, text, messageData }) => {
      console.log(`📨 sendMessage: from ${senderId} to ${receiverId}`);
      console.log("📋 onlineUsers khi gửi:", onlineUsers.map(u => `${u.userId}:${u.socketId}`));
      const receiver = getUser(receiverId);
      if (receiver) {
        console.log(`🎯 Tìm thấy receiver socket: ${receiver.socketId}`);
        // Kiểm tra xem receiver có bật thông báo tin nhắn không
        const setting = await UserSetting.findOne({ userId: receiverId });
        if (!setting || setting.notifications.message !== false) {
          ioInstance.to(receiver.socketId).emit("newNotification", {
            type: "message",
            message: `Bạn có tin nhắn mới`
          });
        }
        ioInstance.to(receiver.socketId).emit("getMessage", messageData);
      } else {
        console.log(`❌ Không tìm thấy receiver: ${receiverId} trong onlineUsers!`);
      }
    });

    // 3.a Lắng nghe sự kiện Thu hồi tin nhắn
    socket.on("recallMessage", ({ messageId, conversationId, receiverId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        ioInstance.to(receiver.socketId).emit("messageRecalled", { messageId, conversationId });
      }
    });

    // 3.b Lắng nghe sự kiện Sửa tin nhắn
    socket.on("editMessage", ({ messageId, newText, receiverId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        ioInstance.to(receiver.socketId).emit("messageEdited", { messageId, newText });
      }
    });

    // 3.c Lắng nghe sự kiện Xóa cuộc trò chuyện cả 2 bên (để forward nếu cần)
    socket.on("deleteConversationForBoth", ({ conversationId, receiverId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        ioInstance.to(receiver.socketId).emit("conversationDeleted", { conversationId });
      }
    });

    // Lắng nghe sự kiện cập nhật setting (để broadcast cập nhật UI ngay)
    socket.on("settingUpdated", async (userId) => {
      // Khi user cập nhật setting (ví dụ tắt Hiển thị trạng thái hoạt động), ta cần update lại onlineUsers list.
      const userIdx = onlineUsers.findIndex(u => u.userId === userId);
      if (userIdx !== -1) {
        const setting = await UserSetting.findOne({ userId });
        if (setting && setting.privacy) {
          onlineUsers[userIdx].isHidden = !setting.privacy.showOnlineStatus;
        }
      }
      const publicUsers = onlineUsers.filter(u => !u.isHidden);
      ioInstance.emit("getOnlineUsers", publicUsers);
    });

    // 4. Xử lý ngắt kết nối
    socket.on("disconnect", () => {
      console.log("Một người dùng ngắt kết nối:", socket.id);
      removeUser(socket.id);
      const publicUsers = onlineUsers.filter(u => !u.isHidden);
      ioInstance.emit("getOnlineUsers", publicUsers);
    });
  });
};

module.exports = { initSocket, getIo, getUser };
