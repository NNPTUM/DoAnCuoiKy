import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Forbidden = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const requiredRoles = location.state?.requiredRoles || [];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.code}>403</div>
        <h1 style={styles.title}>Bạn không đủ quyền truy cập</h1>
        <p style={styles.description}>
          Tài khoản hiện tại không có quyền để mở trang này.
        </p>

        {requiredRoles.length > 0 && (
          <p style={styles.requiredText}>
            Quyền yêu cầu: {requiredRoles.join(", ")}
          </p>
        )}

        <div style={styles.actions}>
          <button style={styles.primaryBtn} onClick={() => navigate("/")}>
            Về trang chủ
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 15% 20%, rgba(11, 107, 203, 0.14), transparent 40%), linear-gradient(150deg, #f8fbff, #eef5ff)",
    padding: "24px",
    fontFamily: "Manrope, Segoe UI, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #d8e6ff",
    boxShadow: "0 12px 34px rgba(16, 33, 61, 0.12)",
    padding: "28px",
    textAlign: "center",
  },
  code: {
    fontSize: "52px",
    fontWeight: 800,
    lineHeight: 1,
    color: "#0b4ad6",
    letterSpacing: "1px",
  },
  title: {
    margin: "12px 0 10px",
    fontSize: "28px",
    color: "#13294b",
  },
  description: {
    margin: 0,
    color: "#4d6488",
    fontSize: "15px",
  },
  requiredText: {
    marginTop: "12px",
    fontSize: "13px",
    color: "#315487",
    fontWeight: 700,
  },
  actions: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(120deg, #0464d8, #0f8bff)",
    color: "#fff",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    border: "1px solid #c7d8f3",
    borderRadius: "10px",
    background: "#fff",
    color: "#1d3f71",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default Forbidden;
