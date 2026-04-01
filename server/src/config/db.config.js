const mongoose = require("mongoose");
const Role = require("../models/role.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

const DEFAULT_ROLES = [
  {
    name: "user",
    description: "Người dùng tiêu chuẩn của hệ thống",
  },
  {
    name: "admin",
    description: "Quản trị viên hệ thống",
  },
  {
    name: "moderator",
    description: "Kiểm duyệt nội dung và cộng đồng",
  },
];

const DEFAULT_ACCOUNTS = [
  {
    roleName: "admin",
    username: process.env.DEFAULT_ADMIN_USERNAME || "admin",
    email: (
      process.env.DEFAULT_ADMIN_EMAIL || "admin@social.local"
    ).toLowerCase(),
    password: process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123",
  },
  {
    roleName: "moderator",
    username: process.env.DEFAULT_MODERATOR_USERNAME || "moderator",
    email: (
      process.env.DEFAULT_MODERATOR_EMAIL || "moderator@social.local"
    ).toLowerCase(),
    password: process.env.DEFAULT_MODERATOR_PASSWORD || "Moderator@123",
  },
];

const seedDefaultAccounts = async () => {
  for (const account of DEFAULT_ACCOUNTS) {
    const role = await Role.findOne({ name: account.roleName }).select(
      "_id name",
    );
    if (!role) continue;

    const existingByEmail = await User.findOne({ email: account.email }).select(
      "_id roleId email username",
    );

    if (existingByEmail) {
      if (String(existingByEmail.roleId) !== String(role._id)) {
        await User.updateOne(
          { _id: existingByEmail._id },
          {
            $set: {
              roleId: role._id,
              isActive: true,
              status: "active",
            },
          },
        );
        console.log(
          `[Seed] Đã cập nhật quyền ${account.roleName} cho tài khoản: ${account.email}`,
        );
      }
      continue;
    }

    const existingByUsername = await User.findOne({
      username: account.username,
    }).select("_id");
    const resolvedUsername = existingByUsername
      ? `${account.username}_${account.roleName}`
      : account.username;

    const hashedPassword = await bcrypt.hash(account.password, 10);
    await User.create({
      username: resolvedUsername,
      email: account.email,
      password: hashedPassword,
      roleId: role._id,
      isActive: true,
      status: "active",
      warningCount: 0,
    });

    console.log(
      `[Seed] Đã tạo tài khoản mặc định ${account.roleName}: ${account.email}`,
    );
  }
};

const connectDB = async () => {
  try {
    // Tắt cảnh báo strictQuery của Mongoose 7+
    mongoose.set("strictQuery", false);

    // Gọi hàm connect và truyền chuỗi URI từ file .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Tạo collection rỗng cho các model đã đăng ký để Atlas hiển thị DB/collections ngay.
    for (const modelName of mongoose.modelNames()) {
      const model = mongoose.model(modelName);
      try {
        await conn.connection.createCollection(model.collection.name);
      } catch (collectionError) {
        // Bỏ qua nếu collection đã tồn tại.
        if (collectionError.codeName !== "NamespaceExists") {
          throw collectionError;
        }
      }
    }

    // Seed dữ liệu Role mặc định nếu DB chưa có.
    for (const roleData of DEFAULT_ROLES) {
      await Role.updateOne(
        { name: roleData.name },
        { $setOnInsert: roleData },
        { upsert: true },
      );
    }

    await seedDefaultAccounts();

    console.log(
      `MongoDB đã kết nối thành công: ${conn.connection.host} | DB: ${conn.connection.name}`,
    );
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    // Dừng toàn bộ server nếu không kết nối được Database
    process.exit(1);
  }
};

module.exports = connectDB;
