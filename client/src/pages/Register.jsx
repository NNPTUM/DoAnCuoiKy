import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import AuthCardLayout from "../components/AuthCardLayout";
import AuthSocialButtons from "../components/AuthSocialButtons";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(true);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        setIsCheckingRegistration(true);
        const response = await API.get("/auth/registration-status");
        const enabled = response.data?.data?.isRegistrationEnabled;
        setIsRegistrationEnabled(enabled !== false);
      } catch {
        setIsRegistrationEnabled(true);
      } finally {
        setIsCheckingRegistration(false);
      }
    };

    fetchRegistrationStatus();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isRegistrationEnabled) {
      alert("Đăng ký tài khoản hiện đang bị tắt bởi quản trị viên.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await API.post("/auth/register", {
        username: formData.fullName, // Map fullName của FE vào username của BE
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        alert("Đăng ký thành công!");
        navigate("/login");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <AuthCardLayout
      title="Tạo tài khoản mới"
      subtitle="Tham gia cùng chúng tôi ngay hôm nay"
      styles={styles}
    >
      <form onSubmit={handleSubmit}>
        {/* Full Name Input */}
        <div style={styles.inputGroup}>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Họ và tên"
            required
            style={styles.input}
          />
        </div>

        {/* Email Input */}
        <div style={styles.inputGroup}>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email của bạn"
            required
            style={styles.input}
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
            placeholder="Mật khẩu"
            required
            style={styles.input}
          />
        </div>

        {/* Confirm Password Input */}
        <div style={styles.inputGroup}>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Xác nhận mật khẩu"
            required
            style={styles.input}
          />
        </div>

        <AuthSocialButtons styles={styles} dividerText="Hoặc đăng ký với" />

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(isHovered ? styles.buttonHover : {}),
            ...(isCheckingRegistration || !isRegistrationEnabled
              ? styles.buttonDisabled
              : {}),
          }}
          disabled={isCheckingRegistration || !isRegistrationEnabled}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isCheckingRegistration
            ? "Đang kiểm tra..."
            : isRegistrationEnabled
              ? "Đăng ký"
              : "Đăng ký đang tắt"}
        </button>

        {!isRegistrationEnabled && !isCheckingRegistration && (
          <p
            style={{
              ...styles.subtitle,
              marginTop: "12px",
              textAlign: "center",
              color: "#c62828",
            }}
          >
            Quản trị viên đang tạm tắt tính năng đăng ký tài khoản.
          </p>
        )}

        <p
          style={{
            ...styles.subtitle,
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            style={{
              color: "#2f6aff",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthCardLayout>
  );
};

// --- BỘ STYLE ĐỒNG BỘ VỚI TRANG LOGIN ---
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#f0f2f5",
    fontFamily:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif",
    padding: "20px", // Thêm chút padding để form không sát viền màn hình trên điện thoại
    boxSizing: "border-box",
  },
  formCard: {
    backgroundColor: "#ffffff",
    padding: "50px 40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "500px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center", // Đã căn giữa giống như bạn yêu cầu ở Login
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
    backgroundColor: "white", // Nền trắng
    color: "black", // Chữ đen
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
    backgroundColor: "#f9fafb",
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
    backgroundColor: "#2f6aff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  },
  buttonHover: {
    backgroundColor: "#2455d3",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default Register;
