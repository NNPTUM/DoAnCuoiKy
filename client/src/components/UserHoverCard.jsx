import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { getStoredUser } from "../utils/storage";

/**
 * UserHoverCard – Bọc quanh avatar/tên của user.
 * Khi hover >= 400ms sẽ hiện popup card với info + nút Thêm bạn / Xem trang.
 *
 * Props:
 *  user   – object { _id, username, avatarUrl, bio }
 *  children – element bị hover (avatar img, tên…)
 */
const SHOW_DELAY = 350;
const HIDE_DELAY = 250;

const UserHoverCard = ({ user, children }) => {
  const [visible, setVisible] = useState(false);
  const [friendStatus, setFriendStatus] = useState("none");
  const [sending, setSending] = useState(false);
  const showTimer = useRef(null);
  const hideTimer = useRef(null);
  const navigate = useNavigate();

  const currentUser = getStoredUser();
  const isMe = currentUser?._id === user?._id || currentUser?.id === user?._id;

  /* --- helper: cancel both timers --- */
  const clearAll = () => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  };

  /* --- trigger handlers --- */
  const onTriggerEnter = () => {
    clearAll();
    showTimer.current = setTimeout(() => setVisible(true), SHOW_DELAY);
  };

  const onTriggerLeave = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY);
  };

  /* --- card handlers --- */
  const onCardEnter = () => {
    clearAll(); // cancel any pending hide
    setVisible(true);
  };

  const onCardLeave = () => {
    hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY);
  };

  /* --- fetch friend status when card opens --- */
  // Dùng ref để không fetch lại nếu đã có kết quả (hoặc user vừa gửi lời mời)
  const statusFetchedRef = useRef(false);

  // Reset flag khi user thay đổi (hover sang người khác)
  useEffect(() => {
    statusFetchedRef.current = false;
    setFriendStatus("none");
  }, [user?._id]);

  useEffect(() => {
    // Không fetch nếu: card ẩn, là mình, chưa có user, đã fetch rồi
    if (!visible || isMe || !user?._id || statusFetchedRef.current) return;

    statusFetchedRef.current = true;
    (async () => {
      try {
        // Dùng endpoint tổng hợp để lấy đúng trạng thái (bao gồm cả lời mời đã gửi)
        const res = await API.get(`/connections/status/${user._id}`);
        if (res.data.success) {
          setFriendStatus(res.data.status); // 'friends' | 'sent' | 'pending' | 'none'
        }
      } catch (_) {}
    })();
  }, [visible, user?._id, isMe]);

  const handleAddFriend = async (e) => {
    e.stopPropagation();
    if (!user?._id) return;
    setSending(true);
    try {
      const res = await API.post("/connections/requests", {
        receiverId: user._id,
      });
      if (res.data.success) {
        setFriendStatus("sent");
        // Đánh dấu đã xử lý để không bị reset khi card đóng/mở lại
        statusFetchedRef.current = true;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi gửi lời mời");
    } finally {
      setSending(false);
    }
  };

  const handleWithdrawFriend = async (e) => {
    e.stopPropagation();
    if (!user?._id) return;
    setSending(true);
    try {
      const res = await API.delete(`/connections/requests/${user._id}`);
      if (res.data.success) {
        setFriendStatus("none");
        statusFetchedRef.current = true;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi thu hồi lời mời");
    } finally {
      setSending(false);
    }
  };

  if (!user) return children;

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      {/* Trigger zone */}
      <span
        style={{ display: "inline-flex" }}
        onMouseEnter={onTriggerEnter}
        onMouseLeave={onTriggerLeave}
      >
        {children}
      </span>

      {visible && (
        <>
          {/* Invisible bridge fills the gap between trigger and card so
              moving the mouse diagonally doesn't close the card */}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              height: "16px", // matches the gap (top: calc(100% + 12px) + a little buffer)
              zIndex: 9998,
            }}
            onMouseEnter={onCardEnter}
            onMouseLeave={onCardLeave}
          />

          {/* The actual card */}
          <div
            style={styles.card}
            onMouseEnter={onCardEnter}
            onMouseLeave={onCardLeave}
          >
            <span style={styles.arrow} />
            <div style={styles.cardCover} />

            <div style={styles.avatarWrap}>
              <img
                src={
                  user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${user.username}`
                }
                alt={user.username}
                style={styles.cardAvatar}
              />
            </div>

            <div style={styles.cardBody}>
              <p style={styles.name}>{user.username}</p>
              {user.bio && <p style={styles.bio}>{user.bio}</p>}

              {isMe ? (
                <div style={styles.actions}>
                  <button
                    style={{ ...styles.btn, ...styles.blueBtn }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile`, { state: { openEdit: true } });
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      edit
                    </span>
                    Chỉnh sửa thông tin
                  </button>
                  <button
                    style={{ ...styles.btn, ...styles.grayBtn }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile`);
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      person
                    </span>
                    Xem trang cá nhân
                  </button>
                </div>
              ) : (
                <div style={styles.actions}>
                  {friendStatus === "friends" ? (
                    <button
                      style={{ ...styles.btn, ...styles.greenBtn }}
                      disabled
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16 }}
                      >
                        check
                      </span>
                      Bạn bè
                    </button>
                  ) : friendStatus === "pending" ? (
                    <button
                      style={{ ...styles.btn, ...styles.grayBtn }}
                      disabled
                    >
                      Đang chờ phê duyệt
                    </button>
                  ) : friendStatus === "sent" ? (
                    <button
                      style={{
                        ...styles.btn,
                        ...styles.grayBtn,
                        cursor: "pointer",
                        color: "#e74c3c",
                      }}
                      onClick={handleWithdrawFriend}
                      disabled={sending}
                    >
                      {sending ? "Đang xử lý..." : "Thu hồi lời mời"}
                    </button>
                  ) : (
                    <button
                      style={{ ...styles.btn, ...styles.blueBtn }}
                      onClick={handleAddFriend}
                      disabled={sending}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16 }}
                      >
                        person_add
                      </span>
                      {sending ? "Đang gửi..." : "Thêm bạn bè"}
                    </button>
                  )}

                  <button
                    style={{ ...styles.btn, ...styles.grayBtn }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${user._id}`);
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      person
                    </span>
                    Xem trang cá nhân
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </span>
  );
};

const styles = {
  card: {
    position: "absolute",
    top: "calc(100% + 12px)",
    left: "50%",
    transform: "translateX(-50%)",
    width: "280px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    zIndex: 9999,
    overflow: "hidden",
    animation: "fadeInUp 0.18s ease",
  },
  arrow: {
    position: "absolute",
    top: "-7px",
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent",
    borderBottom: "8px solid #fff",
    filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.06))",
  },
  cardCover: {
    height: "72px",
    background: "linear-gradient(135deg, #1877F2 0%, #6EE7B7 100%)",
  },
  avatarWrap: {
    marginTop: "-36px",
    display: "flex",
    justifyContent: "center",
  },
  cardAvatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  cardBody: {
    padding: "10px 18px 16px",
    textAlign: "center",
  },
  name: {
    fontWeight: 700,
    fontSize: "16px",
    margin: "4px 0 4px",
    color: "#111",
  },
  bio: {
    fontSize: "12px",
    color: "#6c759e",
    margin: "0 0 12px",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    transition: "opacity 0.15s",
  },
  blueBtn: {
    backgroundColor: "#1877F2",
    color: "#fff",
  },
  grayBtn: {
    backgroundColor: "#e4e6eb",
    color: "#050505",
  },
  greenBtn: {
    backgroundColor: "#e7f5ee",
    color: "#1a7a3c",
    cursor: "default",
  },
};

// Inject keyframe once
if (
  typeof document !== "undefined" &&
  !document.getElementById("hovercard-style")
) {
  const el = document.createElement("style");
  el.id = "hovercard-style";
  el.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateX(-50%) translateY(6px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(el);
}

export default UserHoverCard;
