import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import moment from "moment";
import LeftSidebar from "../components/LeftSidebar";

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
  const [likedPosts, setLikedPosts] = useState({});

  // Comment states
  const [commentInputs, setCommentInputs] = useState({});
  const [postComments, setPostComments] = useState({});
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [activeDropdownCommentId, setActiveDropdownCommentId] = useState(null);

  const currentUserId = currentUser?._id;

  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes, statusRes, pendingRes, reactionsRes] = await Promise.all([
        API.get(`/auth/users/${userId}`),
        API.get(`/posts/user/${userId}`),
        API.get(`/connections/status/${userId}`),
        API.get("/connections/requests/pending"),
        API.get("/posts/reactions/my-posts"),
      ]);

      if (profileRes.data.success) setProfileData(profileRes.data.data);
      if (postsRes.data.success) setPosts(postsRes.data.data);
      if (statusRes.data.success) setFriendStatus(statusRes.data.status);
      if (pendingRes.data.success) setPendingCount(pendingRes.data.data.length);

      if (reactionsRes.data.success) {
        const likedMap = {};
        reactionsRes.data.data.forEach((postId) => {
          likedMap[postId] = true;
        });
        setLikedPosts(likedMap);
      }
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

  const handleLike = async (postId) => {
    try {
      const response = await API.post(`/posts/${postId}/react`, {
        targetModel: "Post",
        type: "like",
      });
      if (response.data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p._id === postId) {
              return {
                ...p,
                reactionCount: response.data.isReacted
                  ? p.reactionCount + 1
                  : Math.max(0, p.reactionCount - 1),
              };
            }
            return p;
          })
        );
        setLikedPosts((prev) => ({
          ...prev,
          [postId]: response.data.isReacted,
        }));
      }
    } catch (error) {
      console.error("Like error", error);
    }
  };

  // Comment handlers
  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    try {
      const response = await API.post(`/posts/${postId}/comments`, {
        content: text,
      });

      if (response.data.success) {
        const newComment = response.data.data;

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
          )
        );

        setPostComments((prev) => ({
          ...prev,
          [postId]: [newComment, ...(prev[postId] || [])],
        }));

        setActiveCommentPostId(postId);
        setCommentInputs({ ...commentInputs, [postId]: "" });
      }
    } catch (error) {
      console.error("Comment error", error);
      alert("Không thể gửi bình luận lúc này.");
    }
  };

  const openCommentModal = async (postId) => {
    setActiveCommentPostId(postId);
    try {
      const response = await API.get(`/posts/${postId}/comments`);
      if (response.data.success) {
        setPostComments((prev) => ({ ...prev, [postId]: response.data.data }));
      }
    } catch (error) {
      console.error("Lỗi lấy bình luận:", error);
    }
  };

  const closeCommentModal = () => {
    setActiveCommentPostId(null);
    setActiveDropdownCommentId(null);
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentContent(comment.content || "");
    setActiveDropdownCommentId(null);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleUpdateComment = async (postId, commentId) => {
    if (!editingCommentContent.trim()) {
      alert("Nội dung không được để trống");
      return;
    }
    setIsUpdatingComment(true);
    try {
      const response = await API.put(`/posts/${postId}/comments/${commentId}`, {
        content: editingCommentContent,
      });
      if (response.data.success) {
        const updatedComment = response.data.data;
        setPostComments((prev) => ({
          ...prev,
          [postId]: prev[postId].map((c) => (c._id === commentId ? updatedComment : c)),
        }));
        cancelEditingComment();
      }
    } catch (error) {
      alert("Sửa bình luận thất bại: " + (error.response?.data?.message || ""));
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      try {
        const response = await API.delete(`/posts/${postId}/comments/${commentId}`);
        if (response.data.success) {
          setPostComments((prev) => ({
            ...prev,
            [postId]: prev[postId].filter((c) => c._id !== commentId),
          }));
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p._id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p
            )
          );
        }
      } catch (error) {
        alert("Xóa bình luận thất bại!");
      }
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
        <LeftSidebar style={styles.leftSidebar} />

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
                        <button
                          onClick={() => handleLike(post._id)}
                          style={{ ...styles.actionBtn, color: likedPosts[post._id] ? "#e74c3c" : "#6c759e" }}
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: likedPosts[post._id] ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                          {post.reactionCount || 0}
                        </button>
                        <button style={styles.actionBtn} onClick={() => openCommentModal(post._id)}>
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

      {/* ===== MODAL BÌNH LUẬN ===== */}
      {activeCommentPostId && (
        <div style={styles.modalOverlay} onClick={closeCommentModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>Bình luận</h3>
              <button style={styles.closeModalBtn} onClick={closeCommentModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={styles.modalBody}>
              {postComments[activeCommentPostId]?.length > 0 ? (
                postComments[activeCommentPostId].map((comment) => (
                  <div key={comment._id} style={styles.commentItem}>
                    <img
                      src={comment.userId?.avatarUrl}
                      alt="Avatar"
                      style={styles.avatarMini}
                    />
                    <div style={styles.commentContentBox}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={styles.commentHeader}>
                          <span style={styles.commentUser}>{comment.userId?.username}</span>
                          <span style={styles.commentHandle}>
                            @{comment.userId?.username?.toLowerCase().replace(/\s/g, "")}
                          </span>
                          <span style={{ color: "#536471", margin: "0 4px" }}>·</span>
                          <span style={styles.commentTime}>{moment(comment.createdAt).fromNow(true)}</span>
                        </div>

                        {currentUserId && currentUserId === (comment.userId?._id || comment.userId) && (
                          <div style={{ position: "relative" }}>
                            <button
                              onClick={() =>
                                setActiveDropdownCommentId(
                                  activeDropdownCommentId === comment._id ? null : comment._id
                                )
                              }
                              style={styles.commentMenuBtn}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>more_horiz</span>
                            </button>
                            {activeDropdownCommentId === comment._id && (
                              <div style={styles.commentDropdown}>
                                <button onClick={() => startEditingComment(comment)} style={styles.dropdownItem}>
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(activeCommentPostId, comment._id)}
                                  style={{ ...styles.dropdownItem, color: "#e74c3c" }}
                                >
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment._id ? (
                        <div style={styles.editCommentBox}>
                          <textarea
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            rows={2}
                            style={styles.editCommentTextarea}
                          />
                          <div style={styles.editCommentActions}>
                            <button
                              type="button"
                              style={styles.cancelCommentBtn}
                              onClick={cancelEditingComment}
                              disabled={isUpdatingComment}
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              style={styles.saveCommentBtn}
                              onClick={() => handleUpdateComment(activeCommentPostId, comment._id)}
                              disabled={isUpdatingComment || !editingCommentContent.trim()}
                            >
                              {isUpdatingComment ? "Lưu..." : "Lưu"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={styles.commentText}>{comment.content}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#6c759e" }}>Chưa có bình luận nào.</div>
              )}
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid #eff3f4", display: "flex", gap: "10px", alignItems: "center", position: "sticky", bottom: 0, backgroundColor: "#fff", zIndex: 10 }}>
              <input
                type="text"
                placeholder="Viết bình luận..."
                value={commentInputs[activeCommentPostId] || ""}
                onChange={(e) =>
                  setCommentInputs({
                    ...commentInputs,
                    [activeCommentPostId]: e.target.value,
                  })
                }
                style={styles.modalCommentInput}
              />
              <button
                onClick={() => handleComment(activeCommentPostId)}
                style={styles.sendBtn}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
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

  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { backgroundColor: "#fff", width: "100%", maxWidth: "500px", maxHeight: "80vh", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", overflowY: "auto", overflowX: "hidden", position: "relative" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #eff3f4", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 },
  closeModalBtn: { background: "none", border: "none", cursor: "pointer", color: "#536471", display: "flex", alignItems: "center", justifyContent: "center" },
  modalBody: { flex: 1, padding: "0" },
  modalCommentInput: { flex: 1, border: "none", outline: "none", fontSize: "15px", background: "#f0f2f5", padding: "10px 16px", borderRadius: "999px" },

  commentItem: { display: "flex", gap: "12px", padding: "12px 16px", alignItems: "flex-start", borderBottom: "1px solid #eff3f4", transition: "background-color 0.2s", cursor: "pointer" },
  avatarMini: { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" },
  commentContentBox: { flex: 1, backgroundColor: "transparent", boxShadow: "none", padding: "0" },
  commentHeader: { display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" },
  commentUser: { fontWeight: 700, fontSize: "15px", color: "#0f1419", margin: 0 },
  commentHandle: { color: "#536471", fontSize: "15px", fontWeight: 400 },
  commentTime: { fontSize: "15px", color: "#536471" },
  commentText: { fontSize: "15px", lineHeight: "20px", margin: 0, color: "#0f1419", wordBreak: "break-word" },
  sendBtn: { backgroundColor: "#1d9bf0", color: "#fff", border: "none", borderRadius: "999px", padding: "8px 16px", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "background 0.2s" },

  commentMenuBtn: { background: "none", border: "none", cursor: "pointer", color: "#536471", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" },
  commentDropdown: { position: "absolute", right: 0, top: "24px", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", borderRadius: "8px", overflow: "hidden", zIndex: 20, minWidth: "100px" },
  dropdownItem: { width: "100%", padding: "8px 16px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: "14px", color: "#0f1419" },
  editCommentBox: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" },
  editCommentTextarea: { width: "100%", background: "#f0f2f5", border: "none", borderRadius: "8px", padding: "8px 12px", resize: "vertical", outline: "none", boxSizing: "border-box", fontSize: "14px", fontFamily: "inherit" },
  editCommentActions: { display: "flex", justifyContent: "flex-end", gap: "8px" },
  cancelCommentBtn: { border: "1px solid #d8dce8", backgroundColor: "#fff", color: "#4c5773", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontWeight: 600, fontSize: "12px" },
  saveCommentBtn: { border: "none", backgroundColor: "#1877F2", color: "#fff", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontWeight: 700, fontSize: "12px" },
};

export default UserProfile;
