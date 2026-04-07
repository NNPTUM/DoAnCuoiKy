import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import moment from "moment";
import UserHoverCard from "../components/UserHoverCard";
import LeftSidebar from "../components/LeftSidebar";
import TopNavbar from "../components/TopNavbar";
import { useSocket } from "../context/SocketContext";
import { getStoredUser } from "../utils/storage";
import { uploadImage } from "../services/upload.service";
import { usePostInteractions } from "../hooks/usePostInteractions";

const formatAlgorithmLabel = (algorithm) => {
  if (algorithm === "engagement") return "Engagement";
  if (algorithm === "hybrid") return "Hybrid";
  return "Chronological";
};

const FEED_PAGE_SIZE = 5;
const REPORT_REASON_OPTIONS = [
  { value: "spam", label: "Spam / quảng cáo" },
  { value: "hate_speech", label: "Ngôn từ thù ghét" },
  { value: "nudity", label: "Nội dung nhạy cảm / khỏa thân" },
  { value: "violence", label: "Bạo lực" },
  { value: "harassment", label: "Quấy rối" },
  { value: "false_information", label: "Thông tin sai lệch" },
  { value: "other", label: "Lý do khác" },
];

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(""); // Lưu nội dung bài viết mới
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // File ảnh chọn từ máy
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [activeDropdownCommentId, setActiveDropdownCommentId] = useState(null);
  const [feedMeta, setFeedMeta] = useState(null);
  const [reportedPosts, setReportedPosts] = useState({});
  const [reportingPostId, setReportingPostId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);

  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId = currentUser?._id || currentUser?.id;
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

  const fetchReportedPosts = useCallback(async () => {
    try {
      const res = await API.get("/moderator/reports/my-reports");
      if (res.data.success) {
        const reportedMap = {};
        res.data.data.forEach((targetId) => {
          reportedMap[targetId] = true;
        });
        setReportedPosts(reportedMap);
      }
    } catch (e) {
      console.error("Lỗi tải lịch sử báo cáo:", e);
    }
  }, []);

  const fetchPosts = useCallback(
    async ({ pageToLoad = 1, replace = false } = {}) => {
      const postsRes = await API.get("/posts", {
        params: { page: pageToLoad, limit: FEED_PAGE_SIZE },
      });

      if (postsRes.data.success) {
        const incomingPosts = Array.isArray(postsRes.data.data)
          ? postsRes.data.data
          : [];

        setPosts((prevPosts) => {
          if (replace) {
            return incomingPosts;
          }

          const existingIds = new Set(prevPosts.map((post) => post._id));
          const dedupedIncoming = incomingPosts.filter(
            (post) => !existingIds.has(post._id),
          );
          return [...prevPosts, ...dedupedIncoming];
        });

        setFeedMeta(postsRes.data.meta || null);
        setPage(pageToLoad);
        setHasMorePosts(incomingPosts.length === FEED_PAGE_SIZE);
      }
    },
    [],
  );

  const fetchMorePosts = useCallback(async () => {
    if (loading || loadingMore || !hasMorePosts) {
      return;
    }

    setLoadingMore(true);
    try {
      await fetchPosts({ pageToLoad: page + 1, replace: false });
    } catch (error) {
      console.error("Lỗi tải thêm bài viết:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPosts, hasMorePosts, loading, loadingMore, page]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const loadInitialFeed = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchPosts({ pageToLoad: 1, replace: true }),
          refreshLikedPosts(),
          fetchReportedPosts(),
        ]);
      } catch (error) {
        console.error("Lỗi lấy bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialFeed();
  }, [
    currentUser,
    fetchPosts,
    fetchReportedPosts,
    navigate,
    refreshLikedPosts,
  ]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchMorePosts();
        }
      },
      {
        root: null,
        rootMargin: "160px 0px",
        threshold: 0.1,
      },
    );

    const sentinel = loadMoreRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
      observer.disconnect();
    };
  }, [fetchMorePosts, loading]);

  // Hàm xử lý Đăng bài viết
  const handleCreatePost = async () => {
    if (!content.trim() && selectedImages.length === 0) return;

    setIsPosting(true);
    try {
      let mediaList = [];

      // 1. Nếu có ảnh, upload ảnh trước để lấy URL và publicId
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(async (file) => {
          const res = await uploadImage(file, "posts");
          if (res.data.success) {
            return {
              url: res.data.imageUrl,
              publicId: res.data.publicId,
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
      console.error(
        "error.response?.data:",
        JSON.stringify(error.response?.data),
      );
      console.error("error.response?.status:", error.response?.status);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi. Vui lòng thử lại.";
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
    setSelectedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
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

  const handleReportPost = async (post) => {
    const optionsText = REPORT_REASON_OPTIONS.map(
      (item, index) => `${index + 1}. ${item.label}`,
    ).join("\n");

    const selectedIndexText = window.prompt(
      `Chọn lý do báo cáo bài viết:\n${optionsText}\nNhập số từ 1 đến ${REPORT_REASON_OPTIONS.length}`,
      "1",
    );

    if (selectedIndexText === null) {
      return;
    }

    const selectedIndex = Number.parseInt(selectedIndexText, 10);
    if (
      !Number.isFinite(selectedIndex) ||
      selectedIndex < 1 ||
      selectedIndex > REPORT_REASON_OPTIONS.length
    ) {
      alert("Lý do báo cáo không hợp lệ.");
      return;
    }

    const selectedReason = REPORT_REASON_OPTIONS[selectedIndex - 1];
    const description = window.prompt("Mô tả thêm (không bắt buộc):", "");

    setReportingPostId(post._id);
    try {
      const res = await API.post("/moderator/reports/submit", {
        targetType: "Post",
        targetId: post._id,
        reason: selectedReason.value,
        description: description?.trim() || "",
      });

      if (res.data?.success) {
        setReportedPosts((prev) => ({ ...prev, [post._id]: true }));
        alert("Đã gửi báo cáo bài viết thành công.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Không thể gửi báo cáo lúc này.");
    } finally {
      setReportingPostId(null);
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
          <div style={styles.feedMetaWrap}>
            <span style={styles.feedBadge}>
              Algorithm:{" "}
              {formatAlgorithmLabel(
                feedMeta?.effectiveAlgorithm || feedMeta?.algorithm,
              )}
            </span>
            {feedMeta?.fallbackApplied && (
              <span style={styles.feedFallbackText}>
                Auto fallback to Chronological do du lieu engagement chua du.
              </span>
            )}
          </div>

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
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    {selectedImages.map((file, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            cursor: "pointer",
                            width: "22px",
                            height: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
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
                    <label
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#1877F2" }}
                      >
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
                    disabled={
                      isPosting ||
                      (!content.trim() && selectedImages.length === 0)
                    }
                    style={{
                      ...styles.postBtn,
                      opacity:
                        isPosting ||
                        (!content.trim() && selectedImages.length === 0)
                          ? 0.6
                          : 1,
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
            <>
              {posts.length === 0 && (
                <p style={{ textAlign: "center" }}>Chưa có bài viết nào.</p>
              )}

              {posts.map((post) => {
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
                              style={{
                                ...styles.avatarSmall,
                                cursor: "pointer",
                              }}
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
                          onClick={() => openCommentModal(post._id)}
                          style={styles.actionBtn}
                        >
                          <span className="material-symbols-outlined">
                            chat_bubble
                          </span>{" "}
                          {post.commentCount || 0}
                        </button>
                        {!isMyPost && (
                          <button
                            onClick={() => handleReportPost(post)}
                            disabled={
                              reportingPostId === post._id ||
                              reportedPosts[post._id]
                            }
                            style={{
                              ...styles.actionBtn,
                              color: reportedPosts[post._id]
                                ? "#d97706"
                                : "#6c759e",
                              opacity:
                                reportingPostId === post._id ||
                                reportedPosts[post._id]
                                  ? 0.65
                                  : 1,
                              cursor:
                                reportingPostId === post._id ||
                                reportedPosts[post._id]
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            <span className="material-symbols-outlined">
                              flag
                            </span>{" "}
                            {reportingPostId === post._id
                              ? "Đang gửi..."
                              : reportedPosts[post._id]
                                ? "Đã báo cáo"
                                : "Báo cáo"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

              <div ref={loadMoreRef} style={{ height: 1 }} />

              {loadingMore && (
                <p style={{ textAlign: "center", color: "#6c759e" }}>
                  Đang tải thêm bài viết...
                </p>
              )}

              {!hasMorePosts && posts.length > 0 && (
                <p style={{ textAlign: "center", color: "#6c759e" }}>
                  Bạn đã xem hết bài viết.
                </p>
              )}
            </>
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
  postBox: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  feedMetaWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  feedBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: 700,
    color: "#0b4ad6",
    backgroundColor: "#e8f1ff",
    border: "1px solid #cfe0ff",
    borderRadius: "999px",
    padding: "6px 10px",
  },
  feedFallbackText: {
    fontSize: "12px",
    color: "#5d7294",
  },
  avatarSmall: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
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
