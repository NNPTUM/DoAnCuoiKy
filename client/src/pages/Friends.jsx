import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import LeftSidebar from "../components/LeftSidebar";
import TopNavbar from "../components/TopNavbar";
import { useSocket } from "../context/SocketContext";
import { getStoredUser } from "../utils/storage";

const Friends = () => {
  const [activeTab, setActiveTab] = useState("suggestions");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { pendingCount, setPendingCount } = useSocket();

  const navigate = useNavigate();
  const currentUser = getStoredUser();

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
        setPendingCount((prev) => Math.max(0, prev - 1));
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
        setPendingCount((prev) => Math.max(0, prev - 1));
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

      <div style={styles.mainLayout}>
        {/* ===== LEFT SIDEBAR ===== */}
        <LeftSidebar style={styles.leftSidebar} />

        {/* ===== CENTER CONTENT ===== */}
        <main style={{ flex: 1, maxWidth: "600px" }}>
          <div style={styles.contentBox}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Quản lý Bạn bè
            </h2>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "10px",
              }}
            >
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
                    cursor: "pointer",
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {loading ? (
              <p style={{ textAlign: "center", color: "#6c759e" }}>
                Đang tải...
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {activeTab === "suggestions" && suggestions.length === 0 && (
                  <p style={{ gridColumn: "span 2", textAlign: "center" }}>
                    Không có gợi ý khả dụng.
                  </p>
                )}
                {activeTab === "suggestions" &&
                  suggestions.map((user) => (
                    <div key={user._id} style={styles.userCard}>
                      <img
                        src={user.avatarUrl}
                        alt="avatar"
                        style={styles.cardAvatar}
                      />
                      <p style={{ fontWeight: 700, margin: "10px 0 4px" }}>
                        {user.username}
                      </p>
                      <button
                        style={styles.primaryBtn}
                        onClick={() => handleSendRequest(user._id)}
                      >
                        Thêm bạn bè
                      </button>
                    </div>
                  ))}

                {activeTab === "requests" && pendingRequests.length === 0 && (
                  <p style={{ gridColumn: "span 2", textAlign: "center" }}>
                    Không có lời mời nào.
                  </p>
                )}
                {activeTab === "requests" &&
                  pendingRequests.map((req) => (
                    <div key={req._id} style={styles.userCard}>
                      <img
                        src={req.senderId?.avatarUrl}
                        alt="avatar"
                        style={styles.cardAvatar}
                      />
                      <p style={{ fontWeight: 700, margin: "10px 0 4px" }}>
                        {req.senderId?.username}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          width: "100%",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          style={{ ...styles.primaryBtn, flex: 1 }}
                          onClick={() => handleAcceptRequest(req._id)}
                        >
                          Xác nhận
                        </button>
                        <button
                          style={{ ...styles.secondaryBtn, flex: 1 }}
                          onClick={() => handleDeclineRequest(req._id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}

                {activeTab === "friends" && friends.length === 0 && (
                  <p style={{ gridColumn: "span 2", textAlign: "center" }}>
                    Bạn chưa có người bạn nào.
                  </p>
                )}
                {activeTab === "friends" &&
                  friends.map((friend) => (
                    <div key={friend._id} style={styles.userCard}>
                      <img
                        src={friend.avatarUrl}
                        alt="avatar"
                        style={styles.cardAvatar}
                      />
                      <p style={{ fontWeight: 700, margin: "10px 0 4px" }}>
                        {friend.username}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          width: "100%",
                          marginTop: "10px",
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          style={styles.secondaryBtn}
                          onClick={() => handleUnfriend(friend._id)}
                        >
                          Hủy kết bạn
                        </button>
                        <button
                          style={{
                            ...styles.secondaryBtn,
                            color: "#d93025",
                            backgroundColor: "#fff4f2",
                          }}
                          onClick={() => handleBlockUser(friend._id)}
                        >
                          Chặn
                        </button>
                      </div>
                    </div>
                  ))}

                {activeTab === "blocks" && blockedUsers.length === 0 && (
                  <p style={{ gridColumn: "span 2", textAlign: "center" }}>
                    Bạn chưa chặn ai.
                  </p>
                )}
                {activeTab === "blocks" &&
                  blockedUsers.map((user) => (
                    <div key={user._id} style={styles.userCard}>
                      <img
                        src={user.avatarUrl}
                        alt="avatar"
                        style={styles.cardAvatar}
                      />
                      <p style={{ fontWeight: 700, margin: "10px 0 4px" }}>
                        {user.username}
                      </p>
                      <button
                        style={styles.primaryBtn}
                        onClick={() => handleUnblockUser(user._id)}
                      >
                        Gỡ chặn
                      </button>
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
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "14px",
  },
  navAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
  },
  logoutBtn: {
    border: "none",
    background: "none",
    color: "#f44336",
    cursor: "pointer",
    fontSize: "13px",
  },
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
  profileImg: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "14px",
  },

  contentBox: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  userCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  cardAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "8px",
    border: "1px solid #eee",
  },
  primaryBtn: {
    width: "100%",
    background: "#1877f2",
    color: "#fff",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  },
  secondaryBtn: {
    width: "100%",
    background: "#e4e6eb",
    color: "#050505",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default Friends;
