const mongoose = require("mongoose");
const FriendRequest = require("../models/friend_request.model");
const Friendship = require("../models/friendship.model");
const Block = require("../models/block.model");
const UserSetting = require("../models/user_setting.model");
const { getIo, getUser } = require("../socket/socket");

// Hàm helper gửi thông báo real-time khi có lời mời kết bạn mới
const sendFriendRequestNotification = async (senderId, receiverId, requestData) => {
  try {
    const receiverSetting = await UserSetting.findOne({ userId: receiverId });
    if (!receiverSetting || receiverSetting.notifications.friendRequest !== false) {
      const io = getIo();
      const socketUser = getUser(receiverId);
      if (io && socketUser) {
        // Lấy thông tin sender để hiển thị tên
        const User = require("../models/user.model");
        const sender = await User.findById(senderId).select("username avatarUrl");
        
        io.to(socketUser.socketId).emit("newNotification", {
          type: "friendRequest",
          message: `${sender?.username || 'Ai đó'} đã gửi cho bạn một lời mời kết bạn!`,
          data: requestData
        });
        io.to(socketUser.socketId).emit("pendingFriendRequestCount");
      }
    }
  } catch (err) {
    console.error("Lỗi gửi thông báo lời mời kết bạn:", err);
  }
};

// 1. GỬI LỜI MỜI KẾT BẠN
exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "Không thể tự kết bạn với chính mình",
      });
    }

    // Kiểm tra xem có ai đang chặn ai không
    const isBlocked = await Block.findOne({
      $or: [
        { blockerId: senderId, blockedId: receiverId },
        { blockerId: receiverId, blockedId: senderId },
      ],
    });
    if (isBlocked)
      return res.status(403).json({
        success: false,
        message: "Không thể gửi lời mời do thao tác chặn",
      });

    // Kiểm tra xem đã là bạn bè chưa
    const isFriend = await Friendship.findOne({
      users: { $all: [senderId, receiverId] },
    });
    if (isFriend)
      return res
        .status(400)
        .json({ success: false, message: "Hai người đã là bạn bè" });

    // Dùng upsert: nếu đã có (dù đã declined/accepted) thì reset về pending, chưa có thì tạo mới
    const existingRequest = await FriendRequest.findOne({
      senderId,
      receiverId,
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Đã gửi lời mời trước đó, đang chờ phê duyệt",
        });
      }
      if (existingRequest.status === "accepted") {
        // Kiểm tra thực tế trong Friendship — có thể họ đã hủy kết bạn
        const stillFriends = await Friendship.findOne({
          users: { $all: [senderId, receiverId] },
        });
        if (stillFriends) {
          return res
            .status(400)
            .json({ success: false, message: "Hai người đã là bạn bè" });
        }
        // Đã hủy kết bạn → reset FriendRequest và cho phép gửi lại
        existingRequest.status = "pending";
        await existingRequest.save();
        await sendFriendRequestNotification(senderId, receiverId, existingRequest);
        return res.status(200).json({
          success: true,
          message: "Đã gửi lời mời kết bạn",
          data: existingRequest,
        });
      }
      // Status là 'declined' → cho phép gửi lại bằng cách reset
      existingRequest.status = "pending";
      await existingRequest.save();
      await sendFriendRequestNotification(senderId, receiverId, existingRequest);
      return res.status(200).json({
        success: true,
        message: "Đã gửi lại lời mời kết bạn",
        data: existingRequest,
      });
    }

    // Chưa tồn tại → tạo mới
    const newRequest = await FriendRequest.create({ senderId, receiverId });
    await sendFriendRequestNotification(senderId, receiverId, newRequest);

    res.status(201).json({
      success: true,
      message: "Đã gửi lời mời kết bạn",
      data: newRequest,
    });
  } catch (error) {
    // Vẫn xử lý duplicate key phòng race condition
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Lời mời đã tồn tại, vui lòng thử lại",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// 1.5. THU HỒI LỜI MỜI KẾT BẠN
exports.withdrawFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    const request = await FriendRequest.findOneAndDelete({
      senderId,
      receiverId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lời mời kết bạn để thu hồi",
      });
    }

    // Phát sự kiện cập nhật số lượng lời mời
    const io = getIo();
    const socketUser = getUser(receiverId);
    if (io && socketUser) {
      io.to(socketUser.socketId).emit("pendingFriendRequestCount");
    }

    res.status(200).json({
      success: true,
      message: "Đã thu hồi lời mời kết bạn",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. CHẤP NHẬN LỜI MỜI KẾT BẠN (Dùng Transaction)
exports.acceptFriendRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const receiverId = req.user.id;

    // Tìm lời mời
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiverId,
      status: "pending",
    });
    if (!request) throw new Error("Không tìm thấy lời mời hợp lệ");

    // Thao tác 1: Cập nhật trạng thái lời mời thành 'accepted'
    request.status = "accepted";
    await request.save({ session });

    // Thao tác 2: Tạo bản ghi bạn bè
    await Friendship.create(
      [
        {
          users: [request.senderId, receiverId],
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Đã chấp nhận kết bạn" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. HỦY KẾT BẠN
exports.unfriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const deletedFriendship = await Friendship.findOneAndDelete({
      users: { $all: [userId, friendId] },
    });

    if (!deletedFriendship) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy quan hệ bạn bè" });
    }

    res.status(200).json({ success: true, message: "Đã hủy kết bạn" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. CHẶN NGƯỜI DÙNG (Dùng Transaction)
exports.blockUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const blockerId = req.user.id;
    const { blockedId } = req.body;

    // Thao tác 1: Tạo bản ghi Block
    await Block.create([{ blockerId, blockedId }], { session });

    // Thao tác 2: Xóa quan hệ bạn bè (nếu có)
    await Friendship.findOneAndDelete(
      {
        users: { $all: [blockerId, blockedId] },
      },
      { session },
    );

    // Thao tác 3: Xóa các lời mời kết bạn đang chờ (nếu có)
    await FriendRequest.deleteMany(
      {
        $or: [
          { senderId: blockerId, receiverId: blockedId, status: "pending" },
          { senderId: blockedId, receiverId: blockerId, status: "pending" },
        ],
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Đã chặn người dùng" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. LẤY DANH SÁCH LỜI MỜI ĐANG CHỜ
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await FriendRequest.find({
      receiverId: userId,
      status: "pending",
    }).populate("senderId", "username avatarUrl"); // Lấy thông tin người gửi

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5b. LẤY DANH SÁCH LỜI MỜI ĐÃ GỬI ĐI
exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await FriendRequest.find({
      senderId: userId,
      status: "pending",
    }).populate("receiverId", "username avatarUrl");
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5c. LẤY TRẠNG THÁI KẾT BẠN VỚI MỘT USER CỤ THỂ
exports.getFriendStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId } = req.params;

    if (userId === targetId) {
      return res.status(200).json({ success: true, status: "me" });
    }

    // Kiểm tra bạn bè
    const isFriend = await Friendship.findOne({
      users: { $all: [userId, targetId] },
    });
    if (isFriend)
      return res.status(200).json({ success: true, status: "friends" });

    // Kiểm tra lời mời mình đã gửi đi
    const sentRequest = await FriendRequest.findOne({
      senderId: userId,
      receiverId: targetId,
      status: "pending",
    });
    if (sentRequest)
      return res.status(200).json({ success: true, status: "sent" });

    // Kiểm tra lời mời người kia gửi đến mình
    const receivedRequest = await FriendRequest.findOne({
      senderId: targetId,
      receiverId: userId,
      status: "pending",
    });
    if (receivedRequest)
      return res.status(200).json({ success: true, status: "pending" });

    return res.status(200).json({ success: true, status: "none" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. TỪ CHỐI LỜI MỜI KẾT BẠN
exports.declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const receiverId = req.user.id;

    const request = await FriendRequest.findOneAndUpdate(
      { _id: requestId, receiverId, status: "pending" },
      { status: "declined" },
    );

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lời mời hợp lệ" });

    res
      .status(200)
      .json({ success: true, message: "Đã từ chối lời mời kết bạn" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. LẤY DANH SÁCH BẠN BÈ
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const friendships = await Friendship.find({ users: userObjectId }).populate(
      "users",
      "username avatarUrl",
    );

    // Rút trích ra danh sách thông tin người còn lại trong từng cặp bạn bè.
    const friendMap = new Map();
    friendships.forEach((f) => {
      const users = Array.isArray(f.users) ? f.users : [];
      const otherUser = users.find(
        (u) => u && u._id && u._id.toString() !== userObjectId.toString(),
      );

      if (otherUser && !friendMap.has(otherUser._id.toString())) {
        friendMap.set(otherUser._id.toString(), otherUser);
      }
    });

    const friends = Array.from(friendMap.values());

    res.status(200).json({ success: true, data: friends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. GỢI Ý KẾT BẠN
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require("../models/user.model");

    // Lấy danh sách bạn bè
    const friendships = await Friendship.find({ users: userId });
    const friendIds = friendships.flatMap((f) =>
      f.users.map((u) => u.toString()),
    );

    // Lấy những người đã gửi/nhận lời mời chưa xử lý hoặc đã từ chối
    const requests = await FriendRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
    const requestedIds = requests.map((r) =>
      r.senderId.toString() === userId
        ? r.receiverId.toString()
        : r.senderId.toString(),
    );

    // Lấy những người bị chặn/chặn mình
    const blocks = await Block.find({
      $or: [{ blockerId: userId }, { blockedId: userId }],
    });
    const blockedIds = blocks.map((b) =>
      b.blockerId.toString() === userId
        ? b.blockedId.toString()
        : b.blockerId.toString(),
    );

    const excludeIds = [
      ...new Set([...friendIds, ...requestedIds, ...blockedIds, userId]),
    ];

    const suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select("username avatarUrl")
      .limit(10);

    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. LẤY DANH SÁCH CHẶN
exports.getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const blocks = await Block.find({ blockerId: userId }).populate(
      "blockedId",
      "username avatarUrl",
    );
    const blockedUsers = blocks.map((b) => b.blockedId);
    res.status(200).json({ success: true, data: blockedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. GỠ CHẶN
exports.unblockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { blockedId } = req.params;

    const block = await Block.findOneAndDelete({ blockerId, blockedId });

    if (!block)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng này trong danh sách chặn",
      });

    res.status(200).json({ success: true, message: "Đã gỡ chặn" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
