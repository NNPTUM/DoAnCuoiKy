import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import LeftSidebar from "../components/LeftSidebar";
import TopNavbar from "../components/TopNavbar";
import { useSocket } from "../context/SocketContext";

const Settings = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("account");
  const { pendingCount } = useSocket();
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // States cho user settings (user_setting.model)
  const [settings, setSettings] = useState({
    theme: "system",
    language: "vi",
    notifications: {
      message: true,
      friendRequest: true,
      postTags: true,
    },
    privacy: {
      showOnlineStatus: true,
      whoCanMessageMe: "everyone",
    },
  });

  // State lưu khi đang lưu để hiện loading
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return navigate("/login");
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const settingsRes = await API.get("/settings"); // Endpoint mình mới tạo

      if (settingsRes.data.success && settingsRes.data.data) {
        setSettings(settingsRes.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu setting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Chỉ gửi lên update phần settings
      const res = await API.put("/settings", settings);
      if (res.data.success) {
        if (socket) {
          socket.emit("settingUpdated", currentUser.id || currentUser._id);
        }
        alert("Lưu cài đặt thành công!");
        window.location.reload(); // Reload để áp dụng Theme ngay lập tức
      }
    } catch (error) {
      console.error("Lỗi cập nhật setting:", error);
      alert("Cập nhật thất bại. Thử lại sau!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotification = (key) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const Toggle = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        backgroundColor: checked ? "#1877F2" : "#e5e7eb",
        cursor: "pointer",
        position: "relative",
        transition: "background-color 0.2s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: checked ? "22px" : "2px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          transition: "left 0.2s ease",
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        fontFamily: "'Inter', sans-serif",
        color: "#232c51",
      }}
    >
      {/* ===== TOP NAVBAR ===== */}
      <TopNavbar />

      {/* ===== MAIN LAYOUT ===== */}
      <div style={styles.mainLayout}>
        {/* LEFT SIDEBAR (Dùng chung component) */}
        <LeftSidebar style={styles.leftSidebar} />

        {/* CENTER CONTENT */}
        <main style={{ flex: 1, maxWidth: "600px", paddingBottom: "40px" }}>
          <div style={styles.contentBox}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
              Cài đặt hệ thống
            </h2>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
                borderBottom: "1px solid #eff3f4",
                paddingBottom: "12px",
                overflowX: "auto",
              }}
            >
              {[
                { id: "account", name: "Tài khoản" },
                { id: "appearance", name: "Giao diện & Ngôn ngữ" },
                { id: "privacy", name: "Quyền riêng tư" },
                { id: "notifications", name: "Thông báo" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? "#e7f3ff" : "none",
                    color: activeTab === tab.id ? "#1877F2" : "#6c759e",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontWeight: activeTab === tab.id ? "700" : "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {loading ? (
              <p style={{ textAlign: "center", color: "#6c759e" }}>Đang tải cấu hình...</p>
            ) : (
              <div>
                {/* ACCOUNT TAB (thông tin cá nhân ở trang settings) */}
                {activeTab === "account" && (
                  <div style={styles.section}>
                    <p style={styles.sectionDesc}>
                      Cài đặt thông tin cá nhân hiện được quản lý tại trang <b>Hồ sơ</b> cá nhân.
                    </p>
                    <button
                      onClick={() => navigate("/profile", { state: { openEdit: true } })}
                      style={styles.primaryBtn}
                    >
                      Đi tới Hồ sơ
                    </button>
                    
                    <div style={{ marginTop: "32px" }}>
                      <h3 style={styles.sectionTitle}>Bảo mật tài khoản</h3>
                      <div style={styles.settingItem}>
                        <div>
                          <p style={styles.settingLabel}>Đổi mật khẩu</p>
                          <p style={styles.settingSub}>Cập nhật mật khẩu thường xuyên để bảo mật.</p>
                        </div>
                        <button style={styles.outlineBtn}>Cập nhật</button>
                      </div>
                      <div style={styles.settingItem}>
                        <div>
                          <p style={styles.settingLabel}>Xóa tài khoản</p>
                          <p style={styles.settingSub}>Dữ liệu sẽ bị xóa hoàn toàn và không thể khôi phục.</p>
                        </div>
                        <button style={{ ...styles.outlineBtn, color: "#e74c3c", borderColor: "#fecaca", backgroundColor: "#fff5f5" }}>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* APPEARANCE TAB */}
                {activeTab === "appearance" && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Chủ đề (Theme)</h3>
                    <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                      {[
                        { id: "light", label: "Sáng", icon: "light_mode" },
                        { id: "dark", label: "Tối", icon: "dark_mode" },
                        { id: "system", label: "Hệ thống", icon: "desktop_windows" },
                      ].map((th) => (
                        <button
                          key={th.id}
                          onClick={() => setSettings({ ...settings, theme: th.id })}
                          style={{
                            ...styles.themeCard,
                            borderColor: settings.theme === th.id ? "#1877F2" : "#e5e7eb",
                            backgroundColor: settings.theme === th.id ? "#f0f7ff" : "#fff",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ color: settings.theme === th.id ? "#1877F2" : "#6c759e", fontSize: "28px", paddingBottom: "8px" }}
                          >
                            {th.icon}
                          </span>
                          <span style={{ fontWeight: 600, color: settings.theme === th.id ? "#1877F2" : "#0f1419" }}>
                            {th.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <h3 style={styles.sectionTitle}>Ngôn ngữ (Language)</h3>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      style={styles.selectInput}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English (US)</option>
                    </select>
                  </div>
                )}

                {/* PRIVACY TAB */}
                {activeTab === "privacy" && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Tuỳ chọn Quyền riêng tư</h3>
                    
                    <div style={styles.settingItem}>
                      <div>
                        <p style={styles.settingLabel}>Hiển thị trạng thái hoạt động</p>
                        <p style={styles.settingSub}>Cho mọi người biết bạn đang online</p>
                      </div>
                      <Toggle
                        checked={settings.privacy.showOnlineStatus}
                        onChange={() =>
                          setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, showOnlineStatus: !settings.privacy.showOnlineStatus },
                          })
                        }
                      />
                    </div>
                    
                    <div style={styles.divider} />
                    
                    <div style={styles.settingItem}>
                      <div style={{ flex: 1 }}>
                        <p style={styles.settingLabel}>Ai có thể nhắn tin cho bạn?</p>
                        <p style={styles.settingSub}>Quản lý những người có thể bắt đầu cuộc trò chuyện mới.</p>
                      </div>
                      <select
                        value={settings.privacy.whoCanMessageMe}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, whoCanMessageMe: e.target.value },
                          })
                        }
                        style={{ ...styles.selectInput, width: "auto" }}
                      >
                        <option value="everyone">Tất cả mọi người</option>
                        <option value="friends">Chỉ bạn bè</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === "notifications" && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Thông báo đẩy</h3>
                    
                    <div style={styles.settingItem}>
                      <div>
                        <p style={styles.settingLabel}>Tin nhắn mới</p>
                        <p style={styles.settingSub}>Nhận thông báo khi có tin nhắn trò chuyện</p>
                      </div>
                      <Toggle
                        checked={settings.notifications.message}
                        onChange={() => handleToggleNotification("message")}
                      />
                    </div>
                    
                    <div style={styles.divider} />
                    
                    <div style={styles.settingItem}>
                      <div>
                        <p style={styles.settingLabel}>Lời mời kết bạn</p>
                        <p style={styles.settingSub}>Nhận thông báo có người gửi kết bạn mới</p>
                      </div>
                      <Toggle
                        checked={settings.notifications.friendRequest}
                        onChange={() => handleToggleNotification("friendRequest")}
                      />
                    </div>
                    
                    <div style={styles.divider} />
                    
                    <div style={styles.settingItem}>
                      <div>
                        <p style={styles.settingLabel}>Tag và Nhắc đến</p>
                        <p style={styles.settingSub}>Thông báo khi bạn được nhắc tới trong bài hoặc bình luận</p>
                      </div>
                      <Toggle
                        checked={settings.notifications.postTags}
                        onChange={() => handleToggleNotification("postTags")}
                      />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "40px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    style={{ ...styles.primaryBtn, opacity: isSaving ? 0.7 : 1 }}
                  >
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 50,
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #e5e7eb",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    boxSizing: "border-box",
  },
  logo: { fontSize: "22px", fontWeight: 800, color: "#1877F2" },
  searchBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    padding: "8px 16px",
    borderRadius: "999px",
    gap: "8px",
  },
  searchInput: { background: "transparent", border: "none", outline: "none", fontSize: "14px" },
  navAvatar: { width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" },
  logoutBtn: { border: "none", background: "none", color: "#f44336", cursor: "pointer", fontSize: "13px" },
  
  mainLayout: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    gap: "24px",
    paddingTop: "80px",
    paddingLeft: "24px",
    paddingRight: "24px",
  },
  leftSidebar: {
    width: "220px",
    flexShrink: 0,
    position: "sticky",
    top: "80px",
    height: "fit-content",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  
  contentBox: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  section: {
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f1419",
    marginBottom: "16px",
  },
  sectionDesc: {
    fontSize: "14px",
    color: "#6c759e",
    marginBottom: "16px",
  },
  settingItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
  },
  settingLabel: {
    margin: 0,
    fontWeight: 600,
    fontSize: "15px",
    color: "#0f1419",
  },
  settingSub: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#6c759e",
  },
  divider: {
    height: "1px",
    backgroundColor: "#eff3f4",
    margin: "4px 0",
  },

  themeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    cursor: "pointer",
    flex: 1,
    transition: "border-color 0.2s",
  },
  selectInput: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "15px",
    fontWeight: 500,
    color: "#0f1419",
    outline: "none",
    width: "100%",
  },

  primaryBtn: {
    backgroundColor: "#1877F2",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },
  outlineBtn: {
    backgroundColor: "#fff",
    color: "#0f1419",
    border: "1px solid #dce2f5",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default Settings;
