const Conversation = require("../models/conversation.model");
const UserSetting = require("../models/user_setting.model");
const Friendship = require("../models/friendship.model");

// 1. LẤY DANH SÁCH CUỘC TRÒ CHUYỆN CỦA USER HIỆN TẠI
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm tất cả các conversation mà mảng members có chứa userId của người đang đăng nhập
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    })
      .populate("members", "username avatarUrl") // Lấy thông tin người chat cùng để FE hiển thị Avatar/Tên
      .sort({ updatedAt: -1 }); // Cuộc trò chuyện có tin nhắn mới nhất sẽ lên đầu

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. TẠO HOẶC LẤY CUỘC TRÒ CHUYỆN 1-1 (Dùng khi ấn nút "Nhắn tin" từ trang Profile/Friends)
exports.createOrGetConversation = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "Không thể tự chat với chính mình" });
    }

    // Kiểm tra xem đoạn chat 1-1 giữa 2 người này đã tồn tại chưa ($all đảm bảo có đủ cả 2 ID)
    let conversation = await Conversation.findOne({
      isGroupChat: false,
      members: { $all: [senderId, receiverId] },
    }).populate("members", "username avatarUrl");

    // Nếu chưa từng chat, tiến hành kiểm tra Quyền riêng tư của receiver
    if (!conversation) {
      const receiverSetting = await UserSetting.findOne({ userId: receiverId });
      
      // Mặc định là 'everyone', nếu họ set 'friends' thì kiểm tra
      if (receiverSetting && receiverSetting.privacy?.whoCanMessageMe === "friends") {
        const isFriend = await Friendship.findOne({
          user1: { $in: [senderId, receiverId] },
          user2: { $in: [senderId, receiverId] },
        });

        if (!isFriend) {
          return res.status(403).json({
            success: false,
            message: "Người dùng này chỉ nhận tin nhắn từ bạn bè.",
          });
        }
      }

      const newConversation = await Conversation.create({
        members: [senderId, receiverId],
        isGroupChat: false,
      });
      conversation = await Conversation.findById(newConversation._id).populate(
        "members",
        "username avatarUrl",
      );
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
