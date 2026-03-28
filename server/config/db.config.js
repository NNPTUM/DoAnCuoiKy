const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Tắt cảnh báo strictQuery của Mongoose 7+
    mongoose.set("strictQuery", false);

    // Gọi hàm connect và truyền chuỗi URI từ file .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB đã kết nối thành công: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    // Dừng toàn bộ server nếu không kết nối được Database
    process.exit(1);
  }
};

module.exports = connectDB;
