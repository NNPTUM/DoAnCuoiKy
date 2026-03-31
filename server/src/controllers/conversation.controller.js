const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const UserSetting = require("../models/user_setting.model");
const Friendship = require("../models/friendship.model");
const { getIo, getUser } = require("../socket/socket");

// 1. LẤY DANH SÁCH CUỘC TRÒ CHUYỆN CỦA USER HIỆN TẠI
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm tất cả conversations mà user là member VÀ chưa bị xóa bởi user này
    const conversations = await Conversation.find({
      members: { $in: [userId] },
      deletedBy: { $nin: [userId] }, // Lọc bỏ những cuộc trò chuyện user đã xóa
    })
      .populate("members", "username avatarUrl")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. TẠO HOẶC LẤY CUỘC TRÒ CHUYỆN 1-1
exports.createOrGetConversation = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "Không thể tự chat với chính mình" });
    }

    let conversation = await Conversation.findOne({
      isGroupChat: false,
      members: { $all: [senderId, receiverId] },
    }).populate("members", "username avatarUrl");

    if (!conversation) {
      const receiverSetting = await UserSetting.findOne({ userId: receiverId });

      if (receiverSetting && receiverSetting.privacy?.whoCanMessageMe === "friends") {
        const isFriend = await Friendship.findOne({
          users: { $all: [senderId, receiverId] },
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
    } else {
      // Nếu cuộc trò chuyện đã bị user này xóa trước đó → khôi phục lại (xóa khỏi deletedBy)
      if (conversation.deletedBy?.some((id) => id.toString() === senderId)) {
        await Conversation.findByIdAndUpdate(conversation._id, {
          $pull: { deletedBy: senderId },
        });
      }
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. XÓA ĐỘC CUỘC TRÒ CHUYỆN CHỈ BÊN MÌNH (Soft Delete)
exports.deleteForMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ success: false, message: "Không tìm thấy cuộc trò chuyện" });

    // Kiểm tra user có trong conversation không
    if (!conversation.members.some((m) => m.toString() === userId))
      return res.status(403).json({ success: false, message: "Bạn không có quyền xóa cuộc trò chuyện này" });

    // Thêm userId vào deletedBy (nếu chưa có)
    await Conversation.findByIdAndUpdate(conversationId, {
      $addToSet: { deletedBy: userId },
    });

    res.status(200).json({ success: true, message: "Đã xóa cuộc trò chuyện khỏi danh sách của bạn" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. XÓA CUỘC TRÒ CHUYỆN CẢ 2 BÊN (Hard Delete)
exports.deleteForBoth = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ success: false, message: "Không tìm thấy cuộc trò chuyện" });

    // Kiểm tra user có trong conversation không
    if (!conversation.members.some((m) => m.toString() === userId))
      return res.status(403).json({ success: false, message: "Bạn không có quyền xóa cuộc trò chuyện này" });

    // Xóa toàn bộ tin nhắn trong conversation
    await Message.deleteMany({ conversationId });

    // Xóa conversation
    await Conversation.findByIdAndDelete(conversationId);

    // Thông báo cho người còn lại qua Socket
    const io = getIo();
    if (io) {
      const otherMembers = conversation.members.filter((m) => m.toString() !== userId);
      otherMembers.forEach((memberId) => {
        const receiverSocket = getUser(memberId.toString());
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit("conversationDeleted", { conversationId });
        }
      });
    }

    res.status(200).json({ success: true, message: "Đã xóa cuộc trò chuyện cho cả 2 bên" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

