import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import moment from "moment";
import LeftSidebar from "../components/LeftSidebar";
import TopNavbar from "../components/TopNavbar";
import { useSocket } from "../context/SocketContext";
import { getStoredUser } from "../utils/storage";
import { uploadImage } from "../services/upload.service";
import { usePostInteractions } from "../hooks/usePostInteractions";

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(getStoredUser());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "" });
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const { pendingCount } = useSocket();

  // Comment states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [activeDropdownCommentId, setActiveDropdownCommentId] = useState(null);

  const currentUserId = profileData?._id;
  const {
    likedPosts,
    refreshLikedPosts,
    handleLike,
    commentInputs,
    setCommentInput,
    postComments,
    activeCommentPostId,
    setActiveCommentPostId,
    openCommentModal,
    handleComment,
    handleUpdateComment,
    handleDeleteComment,
    isUpdatingComment,
  } = usePostInteractions({ setPosts });

  useEffect(() => {
    if (!profileData) {
      navigate("/login");
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/posts/me"),
        refreshLikedPosts(),
      ]);

      if (profileRes.data.success) {
        setProfileData(profileRes.data.data);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...profileData, ...profileRes.data.data }),
        );
      }

      if (postsRes.data.success) {
        setPosts(postsRes.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditProfile = () => {
    setEditForm({
      username: profileData?.username || "",
      bio: profileData?.bio || "",
    });
    setSelectedAvatarFile(null);
    setIsEditingProfile(true);
  };

  // Mở modal nếu navigate truyền state `openEdit`
  useEffect(() => {
    if (location.state?.openEdit && profileData) {
      handleOpenEditProfile();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, profileData]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      let newAvatarUrl = profileData.avatarUrl;

      if (selectedAvatarFile) {
        const res = await uploadImage(selectedAvatarFile, "profile");
        if (res.data.success) {
          newAvatarUrl = res.data.imageUrl;
        } else {
          throw new Error("Upload ảnh thất bại");
        }
      }

      const response = await API.put("/auth/me", {
        username: editForm.username,
        bio: editForm.bio,
        avatarUrl: newAvatarUrl,
      });

      if (response.data.success) {
        setProfileData(response.data.data);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...profileData, ...response.data.data }),
        );
        setIsEditingProfile(false);
        alert("Cập nhật hồ sơ thành công!");
      }
    } catch (error) {
      alert(
        "Cập nhật thất bại: " +
          (error.response?.data?.message || "Lỗi. Vui lòng thử lại."),
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        const response = await API.delete(`/posts/${postId}`);
        if (response.data.success) {
          setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
          if (editingPostId === postId) {
            setEditingPostId(null);
            setEditingContent("");
          }
        }
      } catch (error) {
        alert("Xóa thất bại!");
      }
    }
  };

  const startEditingPost = (post) => {
    setEditingPostId(post._id);
    setEditingContent(post.content || "");
  };

  const cancelEditingPost = () => {
    setEditingPostId(null);
    setEditingContent("");
  };

  const handleUpdatePost = async (postId) => {
    if (!editingContent.trim()) {
      alert("Nội dung bài viết không được để trống");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await API.put(`/posts/${postId}`, {
        content: editingContent,
      });

      if (response.data.success) {
        const updatedPost = response.data.data;
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post._id === postId ? updatedPost : post)),
        );
        cancelEditingPost();
      }
    } catch (error) {
      alert(
        "Sửa bài thất bại: " +
          (error.response?.data?.message || "Vui lòng thử lại"),
      );
    } finally {
      setIsUpdating(false);
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
        {/* ===== LEFT SIDEBAR ===== */}
        <LeftSidebar style={styles.leftSidebar} />

        {/* ===== CENTER PROFILE ===== */}
        <main
          style={{
            flex: 1,
            maxWidth: "600px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Profile Header */}
          <div style={styles.profileHeaderBox}>
            <div style={styles.coverPhoto}></div>
            <div style={styles.profileInfoWrap}>
              <div style={styles.avatarWrap}>
                <img
                  src={profileData?.avatarUrl}
                  alt="Avatar"
                  style={styles.largeAvatar}
                />
              </div>
              <div style={styles.profileActions}>
                <button
                  style={styles.editProfileBtn}
                  onClick={handleOpenEditProfile}
                >
                  Chỉnh sửa hồ sơ
                </button>
              </div>
              <div style={styles.profileDetails}>
                <h1
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "24px",
                    fontWeight: 800,
                  }}
                >
                  {profileData?.username}
                </h1>
                <p
                  style={{
                    margin: "0 0 12px 0",
                    color: "#6c759e",
                    fontSize: "15px",
                  }}
                >
                  @{profileData?.username?.toLowerCase()}
                </p>
                <p
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "15px",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                  }}
                >
                  {profileData?.bio || "Chưa có tiểu sử."}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    color: "#6c759e",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  <span>
                    <strong style={{ color: "#232c51" }}>124</strong> Đang theo
                    dõi
                  </span>
                  <span>
                    <strong style={{ color: "#232c51" }}>1.2K</strong> Người
                    theo dõi
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h3
            style={{
              margin: "10px 0 0",
              fontSize: "18px",
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: "10px",
            }}
          >
            Bài viết của tôi
          </h3>

          {/* List Posts */}
          {loading ? (
            <p style={{ textAlign: "center" }}>Đang tải bài viết...</p>
          ) : posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6c759e" }}>
              Chưa có bài viết nào.
            </p>
          ) : (
            posts.map((post) => {
              const isEditing = editingPostId === post._id;

              return (
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
                          src={post.userId?.avatarUrl || profileData?.avatarUrl}
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
                            {post.userId?.username || profileData?.username}
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
                      {!isEditing && (
                        <div style={styles.ownerActionWrap}>
                          <button
                            type="button"
                            style={styles.editBtn}
                            onClick={() => startEditingPost(post)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            style={styles.deleteBtn}
                            onClick={() => handleDeletePost(post._id)}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div style={styles.editBox}>
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={3}
                          style={styles.editTextarea}
                        />
                        <div style={styles.editActions}>
                          <button
                            type="button"
                            style={styles.cancelBtn}
                            onClick={cancelEditingPost}
                            disabled={isUpdating}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            style={styles.saveBtn}
                            onClick={() => handleUpdatePost(post._id)}
                            disabled={isUpdating || !editingContent.trim()}
                          >
                            {isUpdating ? "Đang lưu..." : "Lưu"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p style={styles.postContent}>{post.content}</p>
                    )}
                  </div>

                  {post.mediaIds && post.mediaIds.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          post.mediaIds.length === 1 ? "1fr" : "1fr 1fr",
                        gap: "2px",
                        borderRadius: "14px",
                        overflow: "hidden",
                        marginTop: "12px",
                      }}
                    >
                      {post.mediaIds.map((media, index) => (
                        <img
                          key={media._id || index}
                          src={media.url}
                          alt="Post"
                          style={{
                            width: "100%",
                            height: "100%",
                            maxHeight:
                              post.mediaIds.length === 1 ? "400px" : "250px",
                            objectFit: "cover",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={styles.postActions}>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <button
                        onClick={() => handleLike(post._id)}
                        style={{
                          ...styles.actionBtn,
                          color: likedPosts[post._id] ? "#e74c3c" : "#6c759e",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontVariationSettings: likedPosts[post._id]
                              ? "'FILL' 1"
                              : "'FILL' 0",
                          }}
                        >
                          favorite
                        </span>{" "}
                        {post.reactionCount || 0}
                      </button>
                      <button
                        style={styles.actionBtn}
                        onClick={() => openCommentModal(post._id)}
                      >
                        <span className="material-symbols-outlined">
                          chat_bubble
                        </span>{" "}
                        {post.commentCount || 0}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </main>

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside style={styles.rightSidebar}>
          <section style={styles.trendCard}>
            <h2 style={{ fontSize: "15px", fontWeight: 800 }}>
              Có thể bạn biết
            </h2>
            <p style={{ fontSize: "13px", color: "#6c759e" }}>
              Hãy theo dõi những người dùng khác
            </p>
          </section>
        </aside>
      </div>

      {/* ===== MODAL CHỈNH SỬA HỒ SƠ ===== */}
      {isEditingProfile && (
        <div
          style={styles.modalOverlay}
          onClick={() => setIsEditingProfile(false)}
        >
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                Chỉnh sửa hồ sơ
              </h3>
              <button
                style={styles.closeModalBtn}
                onClick={() => setIsEditingProfile(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Đổi Avatar */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <img
                  src={
                    selectedAvatarFile
                      ? URL.createObjectURL(selectedAvatarFile)
                      : profileData?.avatarUrl
                  }
                  alt="Preview"
                  style={styles.largeAvatar}
                />
                <label
                  style={{
                    cursor: "pointer",
                    color: "#1877F2",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  Đổi ảnh đại diện
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedAvatarFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Tên */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#6c759e",
                    marginBottom: "4px",
                  }}
                >
                  Tên người dùng
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  style={styles.modalInput}
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#6c759e",
                    marginBottom: "4px",
                  }}
                >
                  Tiểu sử (Bio)
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  rows={4}
                  maxLength={160}
                  style={styles.modalTextarea}
                />
              </div>
            </div>
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid #eff3f4",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile || !editForm.username.trim()}
                style={{
                  ...styles.saveBtn,
                  opacity:
                    isSavingProfile || !editForm.username.trim() ? 0.6 : 1,
                }}
              >
                {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL BÌNH LUẬN ===== */}
      {activeCommentPostId && (
        <div style={styles.modalOverlay} onClick={closeCommentModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                Bình luận
              </h3>
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
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={styles.commentHeader}>
                          <span style={styles.commentUser}>
                            {comment.userId?.username}
                          </span>
                          <span style={styles.commentHandle}>
                            @
                            {comment.userId?.username
                              ?.toLowerCase()
                              .replace(/\s/g, "")}
                          </span>
                          <span style={{ color: "#536471", margin: "0 4px" }}>
                            ·
                          </span>
                          <span style={styles.commentTime}>
                            {moment(comment.createdAt).fromNow(true)}
                          </span>
                        </div>

                        {currentUserId &&
                          currentUserId ===
                            (comment.userId?._id || comment.userId) && (
                            <div style={{ position: "relative" }}>
                              <button
                                onClick={() =>
                                  setActiveDropdownCommentId(
                                    activeDropdownCommentId === comment._id
                                      ? null
                                      : comment._id,
                                  )
                                }
                                style={styles.commentMenuBtn}
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: "18px" }}
                                >
                                  more_horiz
                                </span>
                              </button>
                              {activeDropdownCommentId === comment._id && (
                                <div style={styles.commentDropdown}>
                                  <button
                                    onClick={() => startEditingComment(comment)}
                                    style={styles.dropdownItem}
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(
                                        activeCommentPostId,
                                        comment._id,
                                      )
                                    }
                                    style={{
                                      ...styles.dropdownItem,
                                      color: "#e74c3c",
                                    }}
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
                            onChange={(e) =>
                              setEditingCommentContent(e.target.value)
                            }
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
                              onClick={() =>
                                handleUpdateComment(
                                  activeCommentPostId,
                                  comment._id,
                                  editingCommentContent,
                                  cancelEditingComment,
                                )
                              }
                              disabled={
                                isUpdatingComment ||
                                !editingCommentContent.trim()
                              }
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
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#6c759e",
                  }}
                >
                  Chưa có bình luận nào.
                </div>
              )}
            </div>

            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #eff3f4",
                display: "flex",
                gap: "10px",
                alignItems: "center",
                position: "sticky",
                bottom: 0,
                backgroundColor: "#fff",
                zIndex: 10,
              }}
            >
              <input
                type="text"
                placeholder="Viết bình luận..."
                value={commentInputs[activeCommentPostId] || ""}
                onChange={(e) =>
                  setCommentInput(activeCommentPostId, e.target.value)
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
  rightSidebar: {
    width: "300px",
    flexShrink: 0,
    position: "sticky",
    top: "80px",
    height: "fit-content",
  },
  trendCard: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },

  profileHeaderBox: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  coverPhoto: {
    height: "200px",
    background: "linear-gradient(135deg, #1877F2 0%, #6EE7B7 100%)",
    width: "100%",
  },
  profileInfoWrap: { padding: "0 20px 20px", position: "relative" },
  avatarWrap: {
    marginTop: "-60px",
    display: "inline-block",
    padding: "4px",
    backgroundColor: "#fff",
    borderRadius: "50%",
  },
  largeAvatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #fff",
  },
  profileActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-40px",
  },
  editProfileBtn: {
    border: "1px solid #dce2f5",
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  profileDetails: { marginTop: "12px" },

  postArticle: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    overflow: "visible",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  avatarSmall: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  postContent: { fontSize: "14px", lineHeight: "1.6", margin: "0 0 12px" },
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
  ownerActionWrap: { display: "flex", gap: "8px" },
  editBtn: {
    border: "1px solid #d8e2f5",
    backgroundColor: "#f7f9ff",
    color: "#1a4e9f",
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
  deleteBtn: {
    border: "1px solid #ffd4d0",
    backgroundColor: "#fff4f2",
    color: "#d93025",
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
  editBox: { display: "flex", flexDirection: "column", gap: "10px" },
  editTextarea: {
    width: "100%",
    background: "#f7f5ff",
    border: "1px solid #dce2f5",
    borderRadius: "10px",
    padding: "12px",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  editActions: { display: "flex", justifyContent: "flex-end", gap: "8px" },
  cancelBtn: {
    border: "1px solid #d8dce8",
    backgroundColor: "#fff",
    color: "#4c5773",
    borderRadius: "8px",
    padding: "7px 14px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
  saveBtn: {
    border: "none",
    backgroundColor: "#1877F2",
    color: "#fff",
    borderRadius: "8px",
    padding: "7px 14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "80vh",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #eff3f4",
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  closeModalBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#536471",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalInput: {
    width: "100%",
    border: "1px solid #dce2f5",
    borderRadius: "8px",
    padding: "10px 14px",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
  },
  modalTextarea: {
    width: "100%",
    border: "1px solid #dce2f5",
    borderRadius: "8px",
    padding: "10px 14px",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    resize: "none",
  },
  modalBody: { flex: 1, padding: "0" },
  modalCommentInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "15px",
    background: "#f0f2f5",
    padding: "10px 16px",
    borderRadius: "999px",
  },

  commentItem: {
    display: "flex",
    gap: "12px",
    padding: "12px 16px",
    alignItems: "flex-start",
    borderBottom: "1px solid #eff3f4",
    transition: "background-color 0.2s",
    cursor: "pointer",
  },
  avatarMini: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  commentContentBox: {
    flex: 1,
    backgroundColor: "transparent",
    boxShadow: "none",
    padding: "0",
  },
  commentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginBottom: "2px",
  },
  commentUser: {
    fontWeight: 700,
    fontSize: "15px",
    color: "#0f1419",
    margin: 0,
  },
  commentHandle: { color: "#536471", fontSize: "15px", fontWeight: 400 },
  commentTime: { fontSize: "15px", color: "#536471" },
  commentText: {
    fontSize: "15px",
    lineHeight: "20px",
    margin: 0,
    color: "#0f1419",
    wordBreak: "break-word",
  },
  sendBtn: {
    backgroundColor: "#1d9bf0",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  commentMenuBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#536471",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },
  commentDropdown: {
    position: "absolute",
    right: 0,
    top: "24px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius: "8px",
    overflow: "hidden",
    zIndex: 20,
    minWidth: "100px",
  },
  dropdownItem: {
    width: "100%",
    padding: "8px 16px",
    border: "none",
    background: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    color: "#0f1419",
  },
  editCommentBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
  editCommentTextarea: {
    width: "100%",
    background: "#f0f2f5",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  editCommentActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  cancelCommentBtn: {
    border: "1px solid #d8dce8",
    backgroundColor: "#fff",
    color: "#4c5773",
    borderRadius: "6px",
    padding: "4px 12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
  saveCommentBtn: {
    border: "none",
    backgroundColor: "#1877F2",
    color: "#fff",
    borderRadius: "6px",
    padding: "4px 12px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  },
};

export default Profile;
