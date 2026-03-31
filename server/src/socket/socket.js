// server/src/socket/socket.js
const { Server } = require("socket.io");
const UserSetting = require("../models/user_setting.model"); // Cần check setting quyền riêng tư

let onlineUsers = [];
let ioInstance = null; // Biến toàn cục giữ instance socket

// Hàm thêm user vào danh sách online (nếu user cho phép hiển thị)
const addUser = async (userId, socketId) => {
  // Check setting xem có cho hiển thị online không
  try {
    const setting = await UserSetting.findOne({ userId });
    // Nếu setting có privacy.showOnlineStatus === false, không đưa vào danh sách online
    if (setting && setting.privacy && setting.privacy.showOnlineStatus === false) {
      // Vẫn lưu để backend có thể push notification riêng tư cho người này
      // nhưng có thêm cờ để không trả về trong getOnlineUsers công khai
      !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push({ userId, socketId, isHidden: true });
    } else {
      !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push({ userId, socketId, isHidden: false });
    }
  } catch(error) {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({ userId, socketId, isHidden: false });
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
      origin: "http://localhost:5173", // URL của Frontend React
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("⚡ Một người dùng kết nối:", socket.id);

    // 1. Lắng nghe user đăng nhập và lưu lại
    socket.on("addUser", async (userId) => {
      await addUser(userId, socket.id);
      
      // Chỉ gửi những user đang public trạng thái online
      const publicUsers = onlineUsers.filter(u => !u.isHidden);
      ioInstance.emit("getOnlineUsers", publicUsers);
    });

    // 2. Lắng nghe sự kiện Gửi tin nhắn
    socket.on("sendMessage", async ({ senderId, receiverId, text, messageData }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        // Kiểm tra xem receiver có bật thông báo tin nhắn không
        const setting = await UserSetting.findOne({ userId: receiverId });
        if (!setting || setting.notifications.message !== false) {
          ioInstance.to(receiver.socketId).emit("newNotification", {
            type: "message",
            message: `Bạn có tin nhắn mới`
          });
        }
        ioInstance.to(receiver.socketId).emit("getMessage", messageData);
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
