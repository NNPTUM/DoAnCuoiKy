import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import moment from "moment";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Nếu đang xem profile của chính mình → redirect về /profile
  useEffect(() => {
    if (currentUser?._id === userId || currentUser?.id === userId) {
      navigate("/profile", { replace: true });
    }
  }, [userId]);

  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState("none"); // 'none' | 'sent' | 'pending' | 'friends'
  const [sending, setSending] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes, statusRes, pendingRes] = await Promise.all([
        API.get(`/auth/users/${userId}`),
        API.get(`/posts/user/${userId}`),
        API.get(`/connections/status/${userId}`),
        API.get("/connections/requests/pending"),
      ]);

      if (profileRes.data.success) setProfileData(profileRes.data.data);
      if (postsRes.data.success) setPosts(postsRes.data.data);
      if (statusRes.data.success) setFriendStatus(statusRes.data.status);
      if (pendingRes.data.success) setPendingCount(pendingRes.data.data.length);
    } catch (err) {
      console.error("Lỗi tải profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    setSending(true);
    try {
      const res = await API.post("/connections/requests", { receiverId: userId });
      if (res.data.success) setFriendStatus("sent");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi gửi lời mời");
    } finally {
      setSending(false);
    }
  };

  const renderFriendButton = () => {
    if (friendStatus === "friends") {
      return (
        <button style={{ ...styles.btn, ...styles.greenBtn }} disabled>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
          Bạn bè
        </button>
      );
    }
    if (friendStatus === "sent") {
      return (
        <button style={{ ...styles.btn, ...styles.grayBtn }} disabled>
          Đã gửi lời mời
        </button>
      );
    }
    if (friendStatus === "pending") {
      return (
        <button style={{ ...styles.btn, ...styles.grayBtn }} disabled>
          Đang chờ xác nhận
        </button>
      );
    }
    return (
      <button style={{ ...styles.btn, ...styles.blueBtn }} onClick={handleAddFriend} disabled={sending}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
        {sending ? "Đang gửi..." : "Thêm bạn bè"}
      </button>
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5", fontFamily: "'Inter', sans-serif", color: "#232c51" }}>
      {/* TOP NAVBAR */}
      <nav style={styles.navbar}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span onClick={() => navigate("/")} style={{ ...styles.logo, cursor: "pointer" }}>Tồn Lùng</span>
          <div style={styles.searchBar}>
            <span className="material-symbols-outlined" style={{ color: "#6c759e" }}>search</span>
            <input type="text" placeholder="Tìm kiếm cộng đồng..." style={styles.searchInput} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => navigate("/friends")}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#6c759e" }}>notifications</span>
            {pendingCount > 0 && (
              <span style={{ position: "absolute", top: "-5px", right: "-5px", backgroundColor: "#e74c3c", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "10px", fontWeight: "bold" }}>
                {pendingCount}
              </span>
            )}
          </div>
          <img
            src={currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser?.username}`}
            alt="me"
            style={{ ...styles.navAvatar, cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          />
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={styles.logoutBtn}>
            Đăng xuất
          </button>
        </div>
      </nav>

      <div style={styles.mainLayout}>
        {/* LEFT SIDEBAR */}
        <aside style={styles.leftSidebar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/profile")}>
            <img
              src={currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser?.username}`}
              alt="Me"
              style={styles.profileImg}
            />
            <div>
              <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>{currentUser?.username}</p>
              <p style={{ fontSize: "12px", color: "#6c759e", margin: 0 }}>@{currentUser?.username?.toLowerCase()}</p>
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[
              { icon: "home", label: "Trang chủ", path: "/" },
              { icon: "group", label: "Bạn bè", path: "/friends" },
              { icon: "person", label: "Hồ sơ", path: "/profile" },
              { icon: "explore", label: "Khám phá", path: "#" },
              { icon: "message", label: "Tin nhắn", path: "/messages" },
              { icon: "settings", label: "Cài đặt", path: "/settings" },
            ].map((item) => (
              <a
                key={item.icon}
                href={item.path}
                style={{ ...styles.navLink, backgroundColor: "transparent", color: "#6c759e" }}
                onClick={(e) => {
                  if (item.path.startsWith("/")) {
                    e.preventDefault();
                    navigate(item.path);
                  }
                }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* CENTER CONTENT */}
        <main style={{ flex: 1, maxWidth: "600px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#6c759e" }}>Đang tải...</div>
          ) : !profileData ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#e74c3c" }}>Không tìm thấy người dùng.</div>
          ) : (
            <>
              {/* Profile Header */}
              <div style={styles.profileHeaderBox}>
                <div style={styles.coverPhoto} />
                <div style={styles.profileInfoWrap}>
                  <div style={styles.avatarWrap}>
                    <img
                      src={profileData.avatarUrl || `https://ui-avatars.com/api/?name=${profileData.username}`}
                      alt={profileData.username}
                      style={styles.largeAvatar}
                    />
                  </div>
                  <div style={styles.profileActions}>
                    {renderFriendButton()}
                  </div>
                  <div style={styles.profileDetails}>
                    <h1 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: 800 }}>{profileData.username}</h1>
                    <p style={{ margin: "0 0 12px 0", color: "#6c759e", fontSize: "15px" }}>@{profileData.username?.toLowerCase()}</p>
                    {profileData.bio && (
                      <p style={{ margin: "0 0 16px 0", fontSize: "15px", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                        {profileData.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <h3 style={{ margin: "10px 0 0", fontSize: "18px", borderBottom: "1px solid #e0e0e0", paddingBottom: "10px" }}>
                Bài viết
              </h3>

              {/* Posts */}
              {posts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6c759e" }}>Chưa có bài viết công khai nào.</p>
              ) : (
                posts.map((post) => (
                  <article key={post._id} style={styles.postArticle}>
                    <div style={{ padding: "20px 20px 12px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                        <img
                          src={post.userId?.avatarUrl || `https://ui-avatars.com/api/?name=${post.userId?.username}`}
                          alt={post.userId?.username}
                          style={styles.avatarSmall}
                        />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>{post.userId?.username}</p>
                          <p style={{ fontSize: "12px", color: "#6c759e", margin: 0 }}>{moment(post.createdAt).fromNow()}</p>
                        </div>
                      </div>
                      <p style={styles.postContent}>{post.content}</p>
                    </div>

                    {post.mediaIds && post.mediaIds.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: post.mediaIds.length === 1 ? "1fr" : "1fr 1fr", gap: "2px" }}>
                        {post.mediaIds.map((media, idx) => (
                          <img
                            key={media._id || idx}
                            src={media.url}
                            alt="Post media"
                            style={{ width: "100%", height: "100%", maxHeight: post.mediaIds.length === 1 ? "400px" : "250px", objectFit: "cover" }}
                          />
                        ))}
                      </div>
                    )}

                    <div style={styles.postActions}>
                      <div style={{ display: "flex", gap: "20px" }}>
                        <button style={{ ...styles.actionBtn }}>
                          <span className="material-symbols-outlined">favorite</span>
                          {post.reactionCount || 0}
                        </button>
                        <button style={styles.actionBtn}>
                          <span className="material-symbols-outlined">chat_bubble</span>
                          {post.commentCount || 0}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </>
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside style={styles.rightSidebar}>
          <section style={styles.trendCard}>
            <h2 style={{ fontSize: "15px", fontWeight: 800 }}>Có thể bạn biết</h2>
            <p style={{ fontSize: "13px", color: "#6c759e" }}>Hãy theo dõi những người dùng khác</p>
          </section>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  navbar: { position: "fixed", top: 0, width: "100%", zIndex: 50, backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e7eb", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", boxSizing: "border-box" },
  logo: { fontSize: "22px", fontWeight: 800, color: "#1877F2" },
  searchBar: { display: "flex", alignItems: "center", backgroundColor: "#f0f2f5", padding: "8px 16px", borderRadius: "999px", gap: "8px" },
  searchInput: { background: "transparent", border: "none", outline: "none", fontSize: "14px" },
  navAvatar: { width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" },
  logoutBtn: { border: "none", background: "none", color: "#f44336", cursor: "pointer", fontSize: "13px" },
  mainLayout: { maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "24px", paddingTop: "80px", paddingLeft: "24px", paddingRight: "24px" },
  leftSidebar: { width: "220px", flexShrink: 0, position: "sticky", top: "80px", height: "fit-content", display: "flex", flexDirection: "column", gap: "20px" },
  profileImg: { width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" },
  navLink: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "14px" },
  rightSidebar: { width: "300px", flexShrink: 0, position: "sticky", top: "80px", height: "fit-content" },
  trendCard: { backgroundColor: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  profileHeaderBox: { backgroundColor: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  coverPhoto: { height: "200px", background: "linear-gradient(135deg, #1877F2 0%, #6EE7B7 100%)", width: "100%" },
  profileInfoWrap: { padding: "0 20px 20px", position: "relative" },
  avatarWrap: { marginTop: "-60px", display: "inline-block", padding: "4px", backgroundColor: "#fff", borderRadius: "50%" },
  largeAvatar: { width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff" },
  profileActions: { display: "flex", justifyContent: "flex-end", marginTop: "-40px", gap: "8px" },
  profileDetails: { marginTop: "12px" },
  postArticle: { backgroundColor: "#fff", borderRadius: "14px", overflow: "visible", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "20px" },
  avatarSmall: { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" },
  postContent: { fontSize: "14px", lineHeight: "1.6", margin: "0 0 12px" },
  postActions: { padding: "14px 20px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #f0f2f5" },
  actionBtn: { display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", cursor: "pointer", color: "#6c759e" },
  btn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s" },
  blueBtn: { backgroundColor: "#1877F2", color: "#fff" },
  grayBtn: { backgroundColor: "#e4e6eb", color: "#050505", cursor: "default" },
  greenBtn: { backgroundColor: "#e7f5ee", color: "#1a7a3c", cursor: "default" },
};

export default UserProfile;
