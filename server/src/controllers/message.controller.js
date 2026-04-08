const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const { uploadImageBuffer } = require("../services/cloudinary.service");

// 1. LẤY LỊCH SỬ TIN NHẮN TRONG MỘT ĐOẠN CHAT
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({ conversationId })
    .populate("senderId", "username avatarUrl") // Lấy thông tin người gửi
    .sort({ createdAt: 1 }); // Sắp xếp tăng dần (tin cũ ở trên, tin mới ở dưới cùng)

  res.status(200).json({ success: true, data: messages });
};

// 2. GỬi TIN NHắN MỚI
exports.sendMessage = async (req, res) => {
  const { conversationId, text, imageUrl, messageType } = req.body;
  const senderId = req.user.id;

  if (!text && !imageUrl)
    return res
      .status(400)
      .json({ success: false, message: "Tin nhắn không được để trống" });

  const type = messageType || (imageUrl ? "image" : "text");
  const lastMessagePreview = type === "image" ? "📷 Hình ảnh" : text;

  // Bước 1: Tạo bản ghi tin nhắn mới
  const newMessage = await Message.create({
    conversationId,
    senderId,
    text: text || "",
    imageUrl: imageUrl || null,
    messageType: type,
  });

  // Bước 2: Cập nhật "Tin nhắn cuối cùng" và "Thời gian" cho đoạn chat
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: lastMessagePreview,
    updatedAt: new Date(),
  });

  // Lấy dữ liệu đầy đủ (kèm thông tin người gửi) để trả về cho Frontend hiển thị ngay
  const populatedMessage = await Message.findById(newMessage._id).populate(
    "senderId",
    "username avatarUrl",
  );

  res.status(201).json({ success: true, data: populatedMessage });
};

// 2b. UPLOAD ẢNH TIN NHắN LÊN CLOUDINARY
exports.uploadMessageImage = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "Không có file nào được upload" });

  const result = await uploadImageBuffer(req.file.buffer, {
    folder: "social_app_messages",
    transformation: [{ width: 1200, height: 900, crop: "limit" }],
  });

  res.status(200).json({ success: true, imageUrl: result.secure_url });
};

// 3. THU HỒI TIN NHẮN (isRecalled = true, vẫn giữ trong DB)
exports.recallMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const message = await Message.findById(messageId);
  if (!message)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy tin nhắn" });

  // Chỉ người gửi mới được thu hồi
  if (message.senderId.toString() !== userId)
    return res.status(403).json({
      success: false,
      message: "Không có quyền thu hồi tin nhắn này",
    });

  message.isRecalled = true;
  message.text = "Tin nhắn đã bị thu hồi";
  await message.save();

  res.status(200).json({ success: true, data: message });
};

// 4. SỬa TIN NHẬN
exports.editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  if (!text || !text.trim())
    return res.status(400).json({
      success: false,
      message: "Nội dung tin nhắn không được rỗng",
    });

  const message = await Message.findById(messageId);
  if (!message)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy tin nhắn" });

  // Chỉ người gửi mới được sửa
  if (message.senderId.toString() !== userId)
    return res.status(403).json({
      success: false,
      message: "Không có quyền sửa tin nhắn này",
    });

  // Không thể sửa tin đã thu hồi
  if (message.isRecalled)
    return res.status(400).json({
      success: false,
      message: "Không thể sửa tin nhắn đã thu hồi",
    });

  message.text = text.trim();
  message.isEdited = true;
  await message.save();

  res.status(200).json({ success: true, data: message });
};
