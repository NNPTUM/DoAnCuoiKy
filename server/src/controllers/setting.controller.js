const UserSetting = require("../models/user_setting.model");

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    let setting = await UserSetting.findOne({ userId });

    // Cấp phát mặc định nếu chưa có
    if (!setting) {
      setting = await UserSetting.create({ userId });
    }

    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    console.error("Lỗi get mapping setting:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Chỉ cho phép update những trường có trong schema
    let setting = await UserSetting.findOne({ userId });
    
    if (!setting) {
      // Nếu chưa có, tạo và update sau
      setting = await UserSetting.create({ userId });
    }

    const updatedSetting = await UserSetting.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedSetting });
  } catch (error) {
    console.error("Lỗi update setting:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
