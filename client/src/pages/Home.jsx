import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import moment from "moment";
import UserHoverCard from "../components/UserHoverCard";
import LeftSidebar from "../components/LeftSidebar";
import TopNavbar from "../components/TopNavbar";
import { useSocket } from "../context/SocketContext";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(""); // Lưu nội dung bài viết mới
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // File ảnh chọn từ máy
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [activeDropdownCommentId, setActiveDropdownCommentId] = useState(null);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id || currentUser?.id;

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
      const [postsRes, reactionsRes] = await Promise.all([
        API.get("/posts"),
        API.get("/posts/reactions/my-posts"),
      ]);

      if (postsRes.data.success) {
        setPosts(postsRes.data.data);
      }

      // Khôi phục trạng thái like từ backend
      if (reactionsRes.data.success) {
        const likedMap = {};
        reactionsRes.data.data.forEach((postId) => {
          likedMap[postId] = true;
        });
        setLikedPosts(likedMap);
      }
    } catch (error) {
      console.error("Lỗi lấy bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý Đăng bài viết
  const handleCreatePost = async () => {
    if (!content.trim() && selectedImages.length === 0) return;

    setIsPosting(true);
    try {
      let mediaList = [];

      // 1. Nếu có ảnh, upload ảnh trước để lấy URL và publicId
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);
          const res = await API.post("/upload/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (res.data.success) {
            return {
              url: res.data.imageUrl,
              publicId: res.data.publicId
            };
          }
          throw new Error("Upload ảnh thất bại");
        });

        mediaList = await Promise.all(uploadPromises);
      }

      // 2. Gửi dữ liệu bài viết kèm danh sách media
      const response = await API.post("/posts", {
        content: content,
        privacy: "public",
        media: mediaList,
      });

      if (response.data.success) {
        setPosts((prevPosts) => [response.data.data, ...prevPosts]);
        setContent("");
        setSelectedImages([]); // Reset lại ảnh
      }
    } catch (error) {
      console.error("=== LỖI ĐĂNG BÀI ===");
      console.error("error.message:", error.message);
      console.error("error.response?.data:", JSON.stringify(error.response?.data));
      console.error("error.response?.status:", error.response?.status);
      const errMsg = error.response?.data?.message || error.message || "Lỗi. Vui lòng thử lại.";
      alert("Đăng bài thất bại: " + errMsg);
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...files]);
    // Reset value của input để có thể chọn lại cùng 1 file nếu vừa xóa
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        const response = await API.delete(`/posts/${postId}`);
        if (response.data.success) {
          // Cập nhật lại state để mất bài viết trên giao diện mà không cần F5
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

  // Hàm xử lý Like
  const handleLike = async (postId) => {
    try {
      const response = await API.post(`/posts/${postId}/react`, {
        targetModel: "Post",
        type: "like",
      });
      if (response.data.success) {
        // Cập nhật lại số lượng like trên giao diện dựa trên isReacted
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
          }),
        );
        // Cập nhật trạng thái liked
        setLikedPosts((prev) => ({
          ...prev,
          [postId]: response.data.isReacted,
        }));
      }
    } catch (error) {
      console.error("Like error", error);
    }
  };

  const [commentInputs, setCommentInputs] = useState({});
  const [postComments, setPostComments] = useState({}); // Lưu: { [postId]: [array_comments] }
  const [activeCommentPostId, setActiveCommentPostId] = useState(null); // Lưu: id bài viết đang mở popup bình luận

  // Hàm xử lý Comment
  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    try {
      const response = await API.post(`/posts/${postId}/comments`, {
        content: text,
      });

      if (response.data.success) {
        const newComment = response.data.data; // Lấy dữ liệu comment mới từ Backend

        // 1. Cập nhật số lượng comment trong danh sách Post
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
          ),
        );

        // 2. Đẩy comment mới vào đầu danh sách comment đang hiển thị của Post đó
        setPostComments((prev) => ({
          ...prev,
          [postId]: [newComment, ...(prev[postId] || [])],
        }));

        // 3. Mở popup bình luận
        setActiveCommentPostId(postId);

        // 4. Xóa trắng ô nhập
        setCommentInputs({ ...commentInputs, [postId]: "" });
      }
    } catch (error) {
      console.error("Comment error", error);
      alert("Không thể gửi bình luận lúc này.");
    }
  };

  const openCommentModal = async (postId) => {
    setActiveCommentPostId(postId);
    // Nếu chưa có dữ liệu hoặc muốn cập nhật mới thì gọi API
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
              p._id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p,
            ),
          );
        }
      } catch (error) {
        alert("Xóa bình luận thất bại!");
      }
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

                {selectedImages.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                    {selectedImages.map((file, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }} 
                        />
                        <button 
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", cursor: "pointer", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px"
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px" }}>
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <span className="material-symbols-outlined" style={{ color: "#1877F2" }}>
                        image
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        style={{ display: "none" }} 
                        onChange={handleImageSelect}
                        disabled={isPosting}
                      />
                    </label>
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#1877F2", cursor: "pointer" }}
                    >
                      videocam
                    </span>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={isPosting || (!content.trim() && selectedImages.length === 0)}
                    style={{
                      ...styles.postBtn,
                      opacity: isPosting || (!content.trim() && selectedImages.length === 0) ? 0.6 : 1,
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
            posts.map((post) => {
              const postOwnerId =
                typeof post.userId === "object"
                  ? post.userId?._id
                  : post.userId;
              const isMyPost = currentUserId && postOwnerId === currentUserId;
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
                        <UserHoverCard user={post.userId}>
                          <img
                            src={post.userId?.avatarUrl}
                            alt="Avatar"
                            style={{ ...styles.avatarSmall, cursor: "pointer" }}
                          />
                        </UserHoverCard>
                        <div>
                          <UserHoverCard user={post.userId}>
                            <p
                              style={{
                                fontWeight: 700,
                                fontSize: "14px",
                                margin: 0,
                                cursor: "pointer",
                              }}
                            >
                              {post.userId?.username}
                            </p>
                          </UserHoverCard>
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
                      {isMyPost && !isEditing && (
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
                    <div style={{ display: "grid", gridTemplateColumns: post.mediaIds.length === 1 ? "1fr" : "1fr 1fr", gap: "2px", borderRadius: "14px", overflow: "hidden", marginTop: "12px" }}>
                      {post.mediaIds.map((media, index) => (
                         <img
                           key={media._id || index}
                           src={media.url}
                           alt="Post"
                           style={{ width: "100%", height: "100%", maxHeight: post.mediaIds.length === 1 ? "400px" : "250px", objectFit: "cover" }}
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
                        onClick={() => openCommentModal(post._id)}
                        style={styles.actionBtn}
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
                          <span style={styles.commentUser}>
                            {comment.userId?.username}
                          </span>
                          <span style={styles.commentHandle}>
                            @{comment.userId?.username?.toLowerCase().replace(/\s/g, "")}
                          </span>
                          <span style={{ color: "#536471", margin: "0 4px" }}>·</span>
                          <span style={styles.commentTime}>
                            {moment(comment.createdAt).fromNow(true)}
                          </span>
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
  profileImg: { width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" },
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
  avatarSmall: { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" },
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
    overflow: "visible",
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
  ownerActionWrap: {
    display: "flex",
    gap: "8px",
  },
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
  editBox: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
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
  editActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
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
  commentListSection: {
    backgroundColor: "#fff", // Twitter dùng nền trắng đồng nhất
    borderTop: "1px solid #eff3f4",
    padding: "0", // Bỏ padding để đường kẻ tràn viền
  },
  commentItem: {
    display: "flex",
    gap: "12px",
    padding: "12px 16px",
    alignItems: "flex-start",
    borderBottom: "1px solid #eff3f4", // Đường kẻ phân cách giữa các tweet
    transition: "background-color 0.2s",
    cursor: "pointer",
  },
  avatarMini: {
    width: "40px", // Avatar Twitter to và rõ hơn
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  commentContentBox: {
    flex: 1,
    backgroundColor: "transparent", // Không dùng bong bóng màu
    boxShadow: "none", // Bỏ đổ bóng
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
    fontSize: "15px", // Font chữ to hơn một chút
    color: "#0f1419",
    margin: 0,
  },
  commentHandle: {
    color: "#536471",
    fontSize: "15px",
    fontWeight: 400,
  },
  commentTime: {
    fontSize: "15px",
    color: "#536471",
    before: { content: "'·'", margin: "0 4px" }, // Dấu chấm phân cách thời gian
  },
  commentText: {
    fontSize: "15px",
    lineHeight: "20px",
    margin: 0,
    color: "#0f1419",
    wordBreak: "break-word",
  },
  commentFooter: {
    display: "flex",
    justifyContent: "space-between",
    maxWidth: "425px",
    marginTop: "12px",
    color: "#536471",
  },
  commentInputWrapper: {
    padding: "12px 16px",
    display: "flex",
    gap: "12px",
    borderBottom: "1px solid #eff3f4",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "18px", // Input của Twitter thường to và không có viền
    color: "#0f1419",
    background: "transparent",
  },
  sendBtn: {
    backgroundColor: "#1d9bf0", // Màu xanh Twitter
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s",
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
  modalBody: {
    flex: 1,
    padding: "0",
  },
  modalCommentInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "15px",
    background: "#f0f2f5",
    padding: "10px 16px",
    borderRadius: "999px",
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

export default Home;
