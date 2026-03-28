import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import moment from "moment";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(""); // Lưu nội dung bài viết mới
  const [isPosting, setIsPosting] = useState(false);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Kiểm tra đăng nhập khi vào trang
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      fetchPosts();
    }
  }, []);

  // Hàm lấy danh sách bài viết từ Backend
  const fetchPosts = async () => {
    try {
      const response = await API.get("/posts");
      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý Đăng bài viết
  const handleCreatePost = async () => {
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      const response = await API.post("/posts", {
        content: content,
        userId: currentUser._id, // Backend sẽ dùng ID này để tạo bài viết
      });

      if (response.data.success) {
        // Thêm bài viết mới vào đầu danh sách hiển thị ngay lập tức (Real-time cảm giác)
        setPosts([response.data.data, ...posts]);
        setContent(""); // Xóa trắng ô nhập
      }
    } catch (error) {
      alert(
        "Đăng bài thất bại: " + (error.response?.data?.message || "Lỗi server"),
      );
    } finally {
      setIsPosting(false);
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
      <nav style={styles.navbar}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span style={styles.logo}>The Curator</span>
          <div style={styles.searchBar}>
            <span
              className="material-symbols-outlined"
              style={{ color: "#6c759e" }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm cộng đồng..."
              style={styles.searchInput}
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img
            src={currentUser?.avatarUrl}
            alt="Profile"
            style={styles.navAvatar}
          />
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            style={styles.logoutBtn}
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      <div style={styles.mainLayout}>
        {/* ===== LEFT SIDEBAR ===== */}
        <aside style={styles.leftSidebar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={currentUser?.avatarUrl}
              alt="Me"
              style={styles.profileImg}
            />
            <div>
              <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
                {currentUser?.username}
              </p>
              <p style={{ fontSize: "12px", color: "#6c759e", margin: 0 }}>
                @{currentUser?.username?.toLowerCase()}
              </p>
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {["home", "explore", "message", "bookmark", "settings"].map(
              (icon, idx) => (
                <a
                  key={icon}
                  href="#"
                  style={{
                    ...styles.navLink,
                    backgroundColor: idx === 0 ? "#1877F2" : "transparent",
                    color: idx === 0 ? "#fff" : "#6c759e",
                  }}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  {icon.charAt(0).toUpperCase() + icon.slice(1)}
                </a>
              ),
            )}
          </nav>
        </aside>

        {/* ===== CENTER FEED ===== */}
        <main
          style={{
            flex: 1,
            maxWidth: "600px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Create Post Box */}
          <div style={styles.postBox}>
            <div style={{ display: "flex", gap: "12px" }}>
              <img
                src={currentUser?.avatarUrl}
                alt="Me"
                style={styles.avatarSmall}
              />
              <div style={{ flex: 1 }}>
                <textarea
                  placeholder="Bạn đang nghĩ gì?"
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={styles.textarea}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#1877F2", cursor: "pointer" }}
                    >
                      image
                    </span>
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#1877F2", cursor: "pointer" }}
                    >
                      videocam
                    </span>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={isPosting || !content.trim()}
                    style={{
                      ...styles.postBtn,
                      opacity: isPosting || !content.trim() ? 0.6 : 1,
                    }}
                  >
                    {isPosting ? "Đang đăng..." : "Đăng bài"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List Posts */}
          {loading ? (
            <p style={{ textAlign: "center" }}>Đang tải bảng tin...</p>
          ) : (
            posts.map((post) => (
              <article key={post._id} style={styles.postArticle}>
                <div style={{ padding: "20px 20px 12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={post.userId?.avatarUrl}
                        alt="Avatar"
                        style={styles.avatarSmall}
                      />
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            margin: 0,
                          }}
                        >
                          {post.userId?.username}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#6c759e",
                            margin: 0,
                          }}
                        >
                          {moment(post.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p style={styles.postContent}>{post.content}</p>
                </div>
                {post.mediaIds?.[0]?.url && (
                  <img
                    src={post.mediaIds[0].url}
                    alt="Post"
                    style={styles.postImage}
                  />
                )}
                <div style={styles.postActions}>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <button style={styles.actionBtn}>
                      <span className="material-symbols-outlined">
                        favorite
                      </span>{" "}
                      {post.reactionCount || 0}
                    </button>
                    <button style={styles.actionBtn}>
                      <span className="material-symbols-outlined">
                        chat_bubble
                      </span>{" "}
                      {post.commentCount || 0}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </main>

        {/* ===== RIGHT SIDEBAR (Rút gọn) ===== */}
        <aside style={styles.rightSidebar}>
          <section style={styles.trendCard}>
            <h2 style={{ fontSize: "15px", fontWeight: 800 }}>Xu hướng</h2>
            <p style={{ fontSize: "13px", color: "#6c759e" }}>
              #HUTECH #CongNgheThongTin
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

// --- Styles ---
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
  profileImg: { width: "44px", height: "44px", borderRadius: "50%" },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "14px",
  },
  postBox: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  avatarSmall: { width: "40px", height: "40px", borderRadius: "50%" },
  textarea: {
    width: "100%",
    background: "#f7f5ff",
    border: "none",
    borderRadius: "10px",
    padding: "12px",
    resize: "none",
    outline: "none",
    boxSizing: "border-box",
  },
  postBtn: {
    backgroundColor: "#1877F2",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "8px 22px",
    fontWeight: 700,
    cursor: "pointer",
  },
  postArticle: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  postContent: { fontSize: "14px", lineHeight: "1.6", margin: "0 0 12px" },
  postImage: { width: "100%", maxHeight: "400px", objectFit: "cover" },
  postActions: {
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #f0f2f5",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#6c759e",
  },
  rightSidebar: {
    width: "280px",
    flexShrink: 0,
    position: "sticky",
    top: "80px",
  },
  trendCard: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
};

export default Home;
