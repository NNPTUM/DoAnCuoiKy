import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Friends = () => {
  const [activeTab, setActiveTab] = useState("suggestions");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!currentUser) return navigate("/login");
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "requests") {
        const res = await API.get("/connections/requests/pending");
        if (res.data.success) setPendingRequests(res.data.data);
      } else if (activeTab === "suggestions") {
        const res = await API.get("/connections/suggestions");
        if (res.data.success) setSuggestions(res.data.data);
      } else if (activeTab === "friends") {
        const res = await API.get("/connections/friends");
        if (res.data.success) setFriends(res.data.data);
      } else if (activeTab === "blocks") {
        const res = await API.get("/connections/blocks");
        if (res.data.success) setBlockedUsers(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      const res = await API.post("/connections/requests", { receiverId });
      if (res.data.success) {
        setSuggestions((prev) => prev.filter((s) => s._id !== receiverId));
        alert("Đã gửi lời mời!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi gửi lời mời");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await API.put(`/connections/requests/${requestId}/accept`);
      if (res.data.success) {
        setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
        alert("Đã kết bạn!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi đồng ý kết bạn");
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const res = await API.put(`/connections/requests/${requestId}/decline`);
      if (res.data.success) {
        setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi từ chối");
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy kết bạn?")) return;
    try {
      const res = await API.delete(`/connections/unfriend/${friendId}`);
      if (res.data.success) {
        setFriends((prev) => prev.filter((f) => f._id !== friendId));
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi hủy kết bạn");
    }
  };

  const handleBlockUser = async (blockedId) => {
    if (!window.confirm("Bạn có chắc chắn muốn chặn người này?")) return;
    try {
      const res = await API.post("/connections/block", { blockedId });
      if (res.data.success) {
        setFriends((prev) => prev.filter((f) => f._id !== blockedId));
        setSuggestions((prev) => prev.filter((s) => s._id !== blockedId));
        alert("Đã chặn!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi chặn");
    }
  };

  const handleUnblockUser = async (blockedId) => {
    try {
      const res = await API.delete(`/connections/block/${blockedId}`);
      if (res.data.success) {
        setBlockedUsers((prev) => prev.filter((u) => u._id !== blockedId));
        alert("Đã gỡ chặn thành công!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi gỡ chặn");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5", fontFamily: "'Inter', sans-serif", color: "#232c51" }}>
      {/* ===== TOP NAVBAR ===== */}
      <nav style={styles.navbar}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span onClick={() => navigate("/")} style={{...styles.logo, cursor: "pointer"}}>Tồn Lùng</span>
          <div style={styles.searchBar}>
            <span className="material-symbols-outlined" style={{ color: "#6c759e" }}>search</span>
            <input type="text" placeholder="Tìm kiếm cộng đồng..." style={styles.searchInput} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => setActiveTab("requests")}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#6c759e" }}>notifications</span>
            {pendingRequests.length > 0 && (
              <span style={{
                position: "absolute", top: "-5px", right: "-5px", backgroundColor: "#e74c3c", color: "white",
                borderRadius: "50%", padding: "2px 6px", fontSize: "10px", fontWeight: "bold"
              }}>
                {pendingRequests.length}
              </span>
            )}
          </div>
          <img src={currentUser?.avatarUrl} alt="Profile" style={{...styles.navAvatar, cursor: "pointer"}} onClick={() => navigate("/profile")} />
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={styles.logoutBtn}>
            Đăng xuất
          </button>
        </div>
      </nav>

      <div style={styles.mainLayout}>
        {/* ===== LEFT SIDEBAR ===== */}
        <aside style={styles.leftSidebar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/profile")}>
            <img src={currentUser?.avatarUrl} alt="Me" style={styles.profileImg} />
            <div>
              <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>{currentUser?.username}</p>
              <p style={{ fontSize: "12px", color: "#6c759e", margin: 0 }}>@{currentUser?.username?.toLowerCase()}</p>
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[ { icon: "home", label: "Trang chủ", path: "/" }, { icon: "group", label: "Bạn bè", path: "/friends" }, { icon: "person", label: "Hồ sơ", path: "/profile" }, { icon: "message", label: "Tin nhắn", path: "/messages" } ].map(
              (item) => (
                <a
                  key={item.icon}
                  href={item.path}
                  style={{
                    ...styles.navLink,
                    backgroundColor: item.path === "/friends" ? "#1877F2" : "transparent",
                    color: item.path === "/friends" ? "#fff" : "#6c759e",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </a>
              )
            )}
          </nav>
        </aside>

        {/* ===== CENTER CONTENT ===== */}
        <main style={{ flex: 1, maxWidth: "600px" }}>
          <div style={styles.contentBox}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Quản lý Bạn bè</h2>
            
            {/* Tabs */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px" }}>
              {[
                { id: "suggestions", name: "Gợi ý kết bạn" },
                { id: "requests", name: "Lời mời kết bạn" },
                { id: "friends", name: "Bạn bè của tôi" },
                { id: "blocks", name: "Danh sách chặn" },
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
                    fontWeight: activeTab === tab.id ? "700" : "500",
                    cursor: "pointer"
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {loading ? <p style={{ textAlign: "center", color: "#6c759e" }}>Đang tải...</p> : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {activeTab === "suggestions" && suggestions.length === 0 && <p style={{ gridColumn: "span 2", textAlign: "center" }}>Không có gợi ý khả dụng.</p>}
                {activeTab === "suggestions" && suggestions.map(user => (
                  <div key={user._id} style={styles.userCard}>
                    <img src={user.avatarUrl} alt="avatar" style={styles.cardAvatar} />
                    <p style={{ fontWeight: 700, margin: "10px 0 4px" }}>{user.username}</p>
                    <button style={styles.primaryBtn} onClick={() => handleSendRequest(user._id)}>Thêm bạn bè</button>
                  </div>
                ))}

                {activeTab === "requests" && pendingRequests.length === 0 && <p style={{ gridColumn: "span 2", textAlign: "center" }}>Không có lời mời nào.</p>}
                {activeTab === "requests" && pendingRequests.map(req => (
                  <div key={req._id} style={styles.userCard}>
                    <img src={req.senderId?.avatarUrl} alt="avatar" style={styles.cardAvatar} />
                    <p style={{ fontWeight: 700, margin: "10px 0 4px" }}>{req.senderId?.username}</p>
                    <div style={{ display: "flex", gap: "8px", width: "100%", marginTop: "10px" }}>
                      <button style={{ ...styles.primaryBtn, flex: 1 }} onClick={() => handleAcceptRequest(req._id)}>Xác nhận</button>
                      <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={() => handleDeclineRequest(req._id)}>Xóa</button>
                    </div>
                  </div>
                ))}

                {activeTab === "friends" && friends.length === 0 && <p style={{ gridColumn: "span 2", textAlign: "center" }}>Bạn chưa có người bạn nào.</p>}
                {activeTab === "friends" && friends.map(friend => (
                  <div key={friend._id} style={styles.userCard}>
                    <img src={friend.avatarUrl} alt="avatar" style={styles.cardAvatar} />
                    <p style={{ fontWeight: 700, margin: "10px 0 4px" }}>{friend.username}</p>
                    <div style={{ display: "flex", gap: "8px", width: "100%", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                      <button style={styles.secondaryBtn} onClick={() => handleUnfriend(friend._id)}>Hủy kết bạn</button>
                      <button style={{ ...styles.secondaryBtn, color: "#d93025", backgroundColor: "#fff4f2" }} onClick={() => handleBlockUser(friend._id)}>Chặn</button>
                    </div>
                  </div>
                ))}

                {activeTab === "blocks" && blockedUsers.length === 0 && <p style={{ gridColumn: "span 2", textAlign: "center" }}>Bạn chưa chặn ai.</p>}
                {activeTab === "blocks" && blockedUsers.map(user => (
                  <div key={user._id} style={styles.userCard}>
                    <img src={user.avatarUrl} alt="avatar" style={styles.cardAvatar} />
                    <p style={{ fontWeight: 700, margin: "10px 0 4px" }}>{user.username}</p>
                    <button style={styles.primaryBtn} onClick={() => handleUnblockUser(user._id)}>Gỡ chặn</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  navbar: { position: "fixed", top: 0, width: "100%", zIndex: 50, backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e7eb", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", boxSizing: "border-box" },
  logo: { fontSize: "22px", fontWeight: 800, color: "#1877F2" },
  searchBar: { display: "flex", alignItems: "center", backgroundColor: "#f0f2f5", padding: "8px 16px", borderRadius: "999px", gap: "8px" },
  searchInput: { background: "transparent", border: "none", outline: "none", fontSize: "14px" },
  navAvatar: { width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", cursor: "pointer" },
  logoutBtn: { border: "none", background: "none", color: "#f44336", cursor: "pointer", fontSize: "13px" },
  mainLayout: { maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "24px", paddingTop: "80px", paddingLeft: "24px", paddingRight: "24px" },
  leftSidebar: { width: "220px", flexShrink: 0, position: "sticky", top: "80px", height: "fit-content", display: "flex", flexDirection: "column", gap: "20px" },
  profileImg: { width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" },
  navLink: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "14px" },
  
  contentBox: { backgroundColor: "#fff", padding: "24px", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  userCard: { border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  cardAvatar: { width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginBottom: "8px", border: "1px solid #eee" },
  primaryBtn: { width: "100%", background: "#1877f2", color: "#fff", border: "none", padding: "8px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" },
  secondaryBtn: { width: "100%", background: "#e4e6eb", color: "#050505", border: "none", padding: "8px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" },
};

export default Friends;
