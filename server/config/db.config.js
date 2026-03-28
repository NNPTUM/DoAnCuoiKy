const mongoose = require("mongoose");

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
