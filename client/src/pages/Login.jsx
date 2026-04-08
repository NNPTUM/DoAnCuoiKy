import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import AuthCardLayout from "../components/AuthCardLayout";
import AuthSocialButtons from "../components/AuthSocialButtons";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/auth/login", formData);

      if (response.data.success) {
        // 1. Lưu token và thông tin user vào máy khách
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        // 2. Thông báo SocketContext tạo socket cho user mới đăng nhập
        window.dispatchEvent(new Event("userLoggedIn"));

        alert("Đăng nhập thành công!");
        navigate("/"); // Chuyển về trang chủ
      }
    } catch (error) {
      alert(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <AuthCardLayout
      title="Chào mừng đến với Web"
      subtitle="Đăng nhập để tiếp tục"
      styles={styles}
    >
      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <div style={styles.inputGroup}>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nhập email của bạn"
            required
            style={{ ...styles.input, borderColor: "#a5b4fc" }} // Màu viền xanh nhạt giống ảnh cho input đang active
          />
        </div>

        {/* Password Input */}
        <div style={styles.inputGroup}>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="nhập mật khẩu"
            required
            style={styles.input}
          />
        </div>

        <AuthSocialButtons styles={styles} dividerText="Or continue with" />

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(isHovered ? styles.buttonHover : {}),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Log in
        </button>

        {/* Đã thêm marginTop và textAlign vào đây */}
        <p
          style={{
            ...styles.subtitle,
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/register"
            style={{
              color: "#2f6aff",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Đăng ký
          </Link>
        </p>
      </form>
    </AuthCardLayout>
  );
};

// --- BỘ STYLE THEO THIẾT KẾ MỚI ---
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5", // Màu nền xám nhạt như trong ảnh
    fontFamily:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif",
  },
  formCard: {
    backgroundColor: "#ffffff",
    padding: "50px 40px",
    borderRadius: "4px", // Bo góc nhẹ
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "500px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center", // Căn trái như thiết kế
    marginBottom: "35px",
  },
  title: {
    margin: "0 0 8px 0",
    color: "#202124",
    fontSize: "28px",
    fontWeight: "800",
  },
  subtitle: {
    margin: "0",
    color: "#5f6368",
    fontSize: "15px",
  },
  inputGroup: {
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    backgroundColor: "white", // Đảm bảo nền luôn là màu trắng
    color: "black", // Chữ nhập vào sẽ có màu đen tuyền
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  dividerContainer: {
    display: "flex",
    alignItems: "center",
    margin: "30px 0",
  },
  line: {
    flex: 1,
    height: "1px",
    backgroundColor: "#f3f4f6",
  },
  dividerText: {
    padding: "0 15px",
    color: "#6b7280",
    fontSize: "14px",
  },
  socialGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "35px",
  },
  socialButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f9fafb", // Màu nền xám cực nhạt cho nút mạng xã hội
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  button: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#2f6aff", // Màu xanh dương giống trong ảnh
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  },
  buttonHover: {
    backgroundColor: "#2455d3", // Đậm hơn một chút khi di chuột
  },
};

export default Login;
