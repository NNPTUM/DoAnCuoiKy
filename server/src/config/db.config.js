const mongoose = require("mongoose");
const Role = require("../models/role.model");

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
