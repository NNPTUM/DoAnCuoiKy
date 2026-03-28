import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

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

        alert("Đăng nhập thành công!");
        navigate("/"); // Chuyển về trang chủ
      }
    } catch (error) {
      alert(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>Chào mừng đến với Web</h2>
          <p style={styles.subtitle}>Đăng nhập để tiếp tục</p>
        </div>

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

          {/* Divider: Or continue with */}
          <div style={styles.dividerContainer}>
            <span style={styles.line}></span>
            <span style={styles.dividerText}>Or continue with</span>
            <span style={styles.line}></span>
          </div>

          {/* Social Login Buttons */}
          <div style={styles.socialGroup}>
            <button type="button" style={styles.socialButton}>
              {/* Google Icon SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </button>
            <button type="button" style={styles.socialButton}>
              {/* Meta Icon SVG */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25.5 12C23.0145 12 20.925 13.5 19.5 15.6C18.075 13.5 15.9855 12 13.5 12C9.357 12 6 15.357 6 19.5C6 23.643 9.357 27 13.5 27C15.9855 27 18.075 25.5 19.5 23.4C20.925 25.5 23.0145 27 25.5 27C29.643 27 33 23.643 33 19.5C33 15.357 29.643 12 25.5 12ZM13.5 24C11.0145 24 9 21.9855 9 19.5C9 17.0145 11.0145 15 13.5 15C15.9855 15 18 17.0145 18 19.5C18 21.9855 15.9855 24 13.5 24ZM25.5 24C23.0145 24 21 21.9855 21 19.5C21 17.0145 23.0145 15 25.5 15C27.9855 15 30 17.0145 30 19.5C30 21.9855 27.9855 24 25.5 24Z"
                  fill="#1877F2"
                />
              </svg>
            </button>
            <button type="button" style={styles.socialButton}>
              {/* Apple Icon SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.635 13.061C16.635 9.944 19.167 8.441 19.282 8.369C17.828 6.242 15.536 5.912 14.78 5.818C12.833 5.623 10.959 6.969 9.957 6.969C8.956 6.969 7.423 5.836 5.813 5.854C3.766 5.884 1.889 6.98 0.841 8.802C-1.282 12.474 0.297 17.91 2.366 20.898C3.374 22.353 4.567 23.982 6.138 23.924C7.653 23.865 8.221 22.946 10.038 22.946C11.838 22.946 12.365 23.924 13.938 23.954C15.567 23.982 16.593 22.511 17.585 21.055C18.735 19.378 19.208 17.747 19.237 17.656C19.179 17.632 16.635 16.664 16.635 13.061Z"
                  fill="#000000"
                />
                <path
                  d="M13.238 3.966C14.072 2.957 14.629 1.572 14.476 0.187C13.284 0.235 11.815 0.982 10.952 1.99C10.181 2.89 9.508 4.318 9.689 5.66C11.025 5.764 12.404 4.976 13.238 3.966Z"
                  fill="#000000"
                />
              </svg>
            </button>
          </div>

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
      </div>
    </div>
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
