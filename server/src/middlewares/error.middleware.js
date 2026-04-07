const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Kích thước file vượt quá giới hạn cho phép"
        : err.message;
    return res.status(400).json({ success: false, message });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Đã xảy ra lỗi không mong muốn";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  errorHandler,
};
