import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import moment from "moment";
import LeftSidebar from "../components/LeftSidebar";
import TopNavbar from "../components/TopNavbar";
import { useSocket } from "../context/SocketContext";

export default function Message() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id || currentUser?.id;

  // --- STATES ---
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [inputText, setInputText] = useState("");
  const [activeTab] = useState("/messages");
  const { pendingCount } = useSocket();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [contextMenu, setContextMenu] = useState(null); // { msgId }
  const [editingMsgId, setEditingMsgId] = useState(null); // ID tin đang sửa
  const [editText, setEditText] = useState(""); // Nội dung đang sửa

  const openNewChatModal = async () => {
    setShowNewChatModal(true);
    try {
      const res = await API.get("/connections/friends");
      if (res.data.success) {
        setFriendsList(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách bạn bè:", error);
    }
  };

  // Hàm bắt đầu nhắn tin với 1 người bạn
  const startNewChat = async (friendId) => {
    try {
      // Gọi API tạo hoặc lấy cuộc trò chuyện (đã viết ở bước trước)
      const res = await API.post("/conversations", { receiverId: friendId });
      if (res.data.success) {
        const newConv = res.data.data;

        // Kiểm tra xem đoạn chat này đã có ở cột trái chưa, chưa thì push vào đầu
        if (!conversations.find((c) => c._id === newConv._id)) {
          setConversations([newConv, ...conversations]);
        }

        // Mở khung chat đó lên và đóng bảng danh sách bạn bè
        setActiveConversation(newConv);
        setShowNewChatModal(false);
      }
    } catch (error) {
      console.error("Lỗi tạo phòng chat:", error);
      alert("Không thể tạo cuộc trò chuyện lúc này.");
    }
  };

  // Dùng để tự động cuộn xuống tin nhắn mới nhất
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const isSending = useRef(false); // Guard chống gửi 2 lần cùng lúc
  const [arrivalMessage, setArrivalMessage] = useState(null);

  // --- EFFECTS ---
  // 1. Kiểm tra đăng nhập và lấy dữ liệu ban đầu
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchConversations();
    
  }, []);

  // 2. Tự động lấy tin nhắn khi chọn một cuộc trò chuyện khác
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  // 3. Tự động cuộn xuống cuối mỗi khi mảng messages thay đổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("getMessage", (data) => {
      setArrivalMessage(data);
    });

    // Lắng nghe sự kiện thu hồi tin nhắn từ người kia
    socket.on("messageRecalled", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, isRecalled: true, text: "Tin nhắn đã bị thu hồi" }
            : msg,
        ),
      );
    });

    // Lắng nghe sự kiện sửa tin nhắn từ người kia
    socket.on("messageEdited", ({ messageId, newText }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: newText, isEdited: true }
            : msg,
        ),
      );
    });

    // Chú ý: trong Message.jsx, ta không đăng ký addUser ở đây nữa 
    // vì SocketContext đã thực hiện việc đăng ký (bắn event `addUser`) lúc tạo context.

    return () => {
      socket.off("getMessage");
      socket.off("messageRecalled");
      socket.off("messageEdited");
    };
  }, [socket]);

  useEffect(() => {
    if (!arrivalMessage || !activeConversation) return;

    // Xác định senderId dạng string để so sánh
    const senderIdStr =
      arrivalMessage.senderId?._id?.toString() ||
      arrivalMessage.senderId?.toString();

    // Chỉ thêm nếu là tin nhắn từ người kia (không phải của chính mình đã add rồi)
    const isFromOther = senderIdStr !== currentUserId;

    // Kiểm tra tin nhắn này có thuộc conversation đang mở không
    const belongsToCurrentConv = activeConversation.members.some(
      (m) => m._id === senderIdStr || m._id?.toString() === senderIdStr,
    );

    if (isFromOther && belongsToCurrentConv) {
      // Dedup: không thêm nếu _id đã tồn tại
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === arrivalMessage._id)) return prev;
        return [...prev, arrivalMessage];
      });
    }
  }, [arrivalMessage, activeConversation]);

  // --- API CALLS ---

  const fetchConversations = async () => {
    try {
      const res = await API.get("/conversations");
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách chat:", error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await API.get(`/messages/${conversationId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy tin nhắn:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConversation) return;
    if (isSending.current) return; // Chống double-send
    isSending.current = true;

    const textToSend = inputText;
    setInputText(""); // Xóa input ngay để UX mượt

    try {
      const res = await API.post("/messages", {
        conversationId: activeConversation._id,
        text: textToSend,
      });

      if (res.data.success) {
        const newMessage = res.data.data;

        // 1. Cập nhật tin nhắn vào khung chat (chỉ 1 lần)
        setMessages((prev) => [...prev, newMessage]);

        // 2. Đẩy cuộc trò chuyện lên đầu danh sách và cập nhật lastMessage
        setConversations((prev) => {
          const updatedConvos = prev.map((conv) => {
            if (conv._id === activeConversation._id) {
              return {
                ...conv,
                lastMessage: newMessage.text,
                updatedAt: new Date(),
              };
            }
            return conv;
          });
          // Sắp xếp lại: cái nào mới cập nhật thì lên đầu
          return updatedConvos.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
          );
        });

        // 3. Bắn tin nhắn qua Socket cho người nhận
        const receiver = getOtherUser(activeConversation);
        if (receiver && socket) {
          socket.emit("sendMessage", {
            senderId: currentUserId,
            receiverId: receiver._id,
            text: textToSend,
            messageData: newMessage, // Gửi toàn bộ data tin nhắn vừa lưu DB
          });
        }
      }
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
      setInputText(textToSend); // Khôi phục text nếu gửi thất bại
      alert("Không thể gửi tin nhắn lúc này.");
    } finally {
      isSending.current = false; // Release lock
    }
  };
  // --- THU HỒI TIN NHẬN ---
  const handleRecallMessage = async (messageId) => {
    setContextMenu(null);
    try {
      const res = await API.patch(`/messages/recall/${messageId}`);
      if (res.data.success) {
        // Cập nhật state local
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, isRecalled: true, text: "Tin nhắn đã bị thu hồi" }
              : msg,
          ),
        );
        // Broadcast cho người nhận biết qua socket
        const receiver = getOtherUser(activeConversation);
        if (receiver && socket) {
          socket.emit("recallMessage", {
            messageId,
            conversationId: activeConversation._id,
            receiverId: receiver._id,
          });
        }
      }
    } catch (error) {
      console.error("Thu hồi tin nhắn thất bại:", error);
      alert("Không thể thu hồi tin nhắn.");
    }
  };

  // --- SỬa TIN NHẬN ---
  const handleEditMessage = async (messageId) => {
    if (!editText.trim()) return;
    try {
      const res = await API.patch(`/messages/edit/${messageId}`, { text: editText });
      if (res.data.success) {
        // Cập nhật local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, text: editText.trim(), isEdited: true }
              : msg,
          ),
        );
        // Broadcast cho người nhận biết qua socket
        const receiver = getOtherUser(activeConversation);
        if (receiver && socket) {
          socket.emit("editMessage", {
            messageId,
            newText: editText.trim(),
            receiverId: receiver._id,
          });
        }
        // Đóng chế độ sửa
        setEditingMsgId(null);
        setEditText("");
      }
    } catch (error) {
      console.error("Sửa tin nhắn thất bại:", error);
      alert("Không thể sửa tin nhắn.");
    }
  };

  // Đóng context menu khi click ra ngoài
  const handleGlobalClick = () => {
    if (contextMenu) setContextMenu(null);
  };

  // Tìm thông tin người đang chat cùng (lọc bản thân ra khỏi mảng members)
  const getOtherUser = (conversation) => {
    if (!conversation || !conversation.members) return null;
    return conversation.members.find((m) => m._id !== currentUserId);
  };

  return (
    <div style={styles.container} onClick={handleGlobalClick}>
      {/* ===== TOP NAVBAR ===== */}
      <TopNavbar />

      {/* ===== MAIN LAYOUT ===== */}
      <div style={styles.mainLayout}>
        {/* ===== LEFT SIDEBAR ===== */}
        {/* ===== LEFT SIDEBAR ===== */}
        <LeftSidebar style={styles.leftSidebar} />

        {/* ===== MESSAGE UI ===== */}
        <main style={styles.messageBox}>
          {/* --- LEFT: Conversation List --- */}
          <section style={styles.convoList}>
            <div style={styles.convoHeader}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#0f1419",
                }}
              >
                Tin nhắn
              </h2>
              <button style={styles.iconBtnPrimary} onClick={openNewChatModal}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  edit_square
                </span>
              </button>
            </div>

            <div style={styles.listWrapper}>
              {conversations.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#6c759e",
                    marginTop: "20px",
                    fontSize: "14px",
                  }}
                >
                  Chưa có tin nhắn nào.
                </p>
              ) : (
                conversations.map((conv) => {
                  const otherUser = getOtherUser(conv);
                  const isActive = activeConversation?._id === conv._id;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => setActiveConversation(conv)}
                      style={{
                        ...styles.convItem,
                        backgroundColor: isActive ? "#e7f3ff" : "transparent",
                        borderLeft: isActive
                          ? "3px solid #1877F2"
                          : "3px solid transparent",
                      }}
                    >
                      <div style={styles.avatarWrap}>
                        <img
                          src={
                            otherUser?.avatarUrl ||
                            "https://via.placeholder.com/150"
                          }
                          alt=""
                          style={styles.convAvatar}
                        />
                      </div>
                      <div style={styles.convDetails}>
                        <div style={styles.convTitleRow}>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "#0f1419",
                            }}
                          >
                            {otherUser?.username || "Người dùng"}
                          </span>
                          <span style={{ fontSize: "12px", color: "#6c759e" }}>
                            {conv.updatedAt
                              ? moment(conv.updatedAt).fromNow(true)
                              : ""}
                          </span>
                        </div>
                        <div style={styles.convPreviewRow}>
                          <span
                            style={{
                              ...styles.convPreview,
                              color: "#6c759e",
                              fontWeight: 400,
                            }}
                          >
                            {conv.lastMessage || "Chưa có tin nhắn"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* --- RIGHT: Chat Window --- */}
          <section style={styles.chatWindow}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div style={styles.chatHeader}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={styles.avatarWrap}>
                      <img
                        src={getOtherUser(activeConversation)?.avatarUrl}
                        alt=""
                        style={styles.convAvatar}
                      />
                      <span style={styles.onlineBadge} />
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f1419",
                        }}
                      >
                        {getOtherUser(activeConversation)?.username}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#1877F2",
                        }}
                      >
                        Đang hoạt động
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={styles.iconBtnOutlined}>
                      <span className="material-symbols-outlined">call</span>
                    </button>
                    <button style={styles.iconBtnOutlined}>
                      <span className="material-symbols-outlined">
                        videocam
                      </span>
                    </button>
                    <button style={styles.iconBtnOutlined}>
                      <span className="material-symbols-outlined">info</span>
                    </button>
                  </div>
                </div>

                {/* Message Thread */}
                <div style={styles.chatThread}>
                  {messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#6c759e",
                        marginTop: "auto",
                        marginBottom: "auto",
                      }}
                    >
                      Hãy gửi lời chào đến{" "}
                      {getOtherUser(activeConversation)?.username}!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      // senderId có thể là object (sau populate) hoặc string (tin nhắn socket thô)
                      const senderIdStr =
                        msg.senderId?._id?.toString() ||
                        msg.senderId?.toString();
                      const isMe = senderIdStr === currentUserId;
                      const isRecalled = msg.isRecalled;

                      return (
                        <div
                          key={msg._id}
                          style={{
                            ...styles.msgWrapper,
                            justifyContent: isMe ? "flex-end" : "flex-start",
                          }}
                        >
                          {!isMe && (
                            <img
                              src={getOtherUser(activeConversation)?.avatarUrl}
                              alt=""
                              style={styles.msgAvatar}
                            />
                          )}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isMe ? "flex-end" : "flex-start",
                              maxWidth: "70%",
                              position: "relative",
                            }}
                          >
                            {/* Nút 3 chấm chỉ hiển thị khi là tin của mình và chưa thu hồi và không đang sửa */}
                            {isMe && !isRecalled && editingMsgId !== msg._id && (
                              <button
                                style={styles.msgMenuBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContextMenu(
                                    contextMenu?.msgId === msg._id
                                      ? null
                                      : { msgId: msg._id },
                                  );
                                }}
                                title="Tùy chọn"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>more_horiz</span>
                              </button>
                            )}

                            {/* Context Menu */}
                            {contextMenu?.msgId === msg._id && (
                              <div
                                style={styles.contextMenu}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  style={styles.contextMenuItem}
                                  onClick={() => {
                                    setContextMenu(null);
                                    setEditingMsgId(msg._id);
                                    setEditText(msg.text);
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                                  Sửa tin nhắn
                                </button>
                                <button
                                  style={styles.contextMenuItem}
                                  onClick={() => handleRecallMessage(msg._id)}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>undo</span>
                                  Thu hồi tin nhắn
                                </button>
                              </div>
                            )}

                            {/* Nội dung tin nhắn / Inline edit */}
                            {editingMsgId === msg._id ? (
                              /* Chế độ sửa inline */
                              <div style={styles.editInputWrapper} onClick={(e) => e.stopPropagation()}>
                                <input
                                  autoFocus
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") { e.preventDefault(); handleEditMessage(msg._id); }
                                    if (e.key === "Escape") { setEditingMsgId(null); setEditText(""); }
                                  }}
                                  style={styles.editInput}
                                />
                                <div style={{ display: "flex", gap: "6px", marginTop: "6px", justifyContent: "flex-end" }}>
                                  <button
                                    style={styles.editCancelBtn}
                                    onClick={() => { setEditingMsgId(null); setEditText(""); }}
                                  >Hủy</button>
                                  <button
                                    style={styles.editSaveBtn}
                                    onClick={() => handleEditMessage(msg._id)}
                                  >Lưu</button>
                                </div>
                              </div>
                            ) : isRecalled ? (
                              <div style={isMe ? styles.bubbleRecalledOut : styles.bubbleRecalledIn}>
                                <span className="material-symbols-outlined" style={{ fontSize: "14px", verticalAlign: "middle", marginRight: "4px" }}>block</span>
                                Tin nhắn đã bị thu hồi
                              </div>
                            ) : (
                              msg.text && (
                                <div style={isMe ? styles.bubbleOut : styles.bubbleIn}>
                                  {msg.text}
                                </div>
                              )
                            )}
                            <div style={styles.msgMeta}>
                              {moment(msg.createdAt).format("LT")}
                              {msg.isEdited && !isRecalled && (
                                <span style={{ fontStyle: "italic", fontSize: "10px" }}>(đã chỉnh sửa)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Element ẩn để auto-scroll scroll xuống cuổi */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Box */}
                <div style={styles.inputArea}>
                  <button style={styles.inputIconBtn}>
                    <span className="material-symbols-outlined">
                      add_circle
                    </span>
                  </button>
                  <button style={styles.inputIconBtn}>
                    <span className="material-symbols-outlined">image</span>
                  </button>
                  <div style={styles.inputWrapper}>
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Ngăn browser tự trigger click vào button
                          handleSendMessage();
                        }
                      }}
                      style={styles.chatInput}
                    />
                    <button style={styles.emojiBtn}>
                      <span className="material-symbols-outlined">mood</span>
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    style={
                      inputText.trim() ? styles.sendBtnActive : styles.sendBtn
                    }
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ marginLeft: "2px" }}
                    >
                      send
                    </span>
                  </button>
                </div>
              </>
            ) : (
              // Empty State khi chưa chọn Chat
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#6c759e",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "64px",
                    color: "#dce2f5",
                    marginBottom: "16px",
                  }}
                >
                  forum
                </span>
                <h3 style={{ margin: 0, color: "#0f1419" }}>
                  Tin nhắn của bạn
                </h3>
                <p style={{ marginTop: "8px" }}>
                  Chọn một người bạn bè để bắt đầu trò chuyện.
                </p>
              </div>
            )}
          </section>
        </main>
        {/* ===== MODAL TẠO TIN NHẮN MỚI ===== */}
        {showNewChatModal && (
          <div
            style={styles.modalOverlay}
            onClick={() => setShowNewChatModal(false)}
          >
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                  Tin nhắn mới
                </h3>
                <button
                  style={styles.closeModalBtn}
                  onClick={() => setShowNewChatModal(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div style={styles.modalBody}>
                <div
                  style={{ padding: "16px", borderBottom: "1px solid #eff3f4" }}
                >
                  <input
                    type="text"
                    placeholder="Tìm kiếm bạn bè..."
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {friendsList.length > 0 ? (
                    friendsList.map((friend) => (
                      <div
                        key={friend._id}
                        style={styles.friendItem}
                        onClick={() => startNewChat(friend._id)}
                      >
                        <img
                          src={
                            friend.avatarUrl ||
                            "https://via.placeholder.com/150"
                          }
                          alt=""
                          style={styles.friendAvatar}
                        />
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 600,
                              color: "#0f1419",
                              fontSize: "15px",
                            }}
                          >
                            {friend.username}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              color: "#6c759e",
                              fontSize: "13px",
                            }}
                          >
                            @{friend.username.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#6c759e",
                        padding: "20px",
                      }}
                    >
                      Chưa có bạn bè nào để nhắn tin.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #dce2f5; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #b0b9d1; }
      `}</style>
    </div>
  );
}

// --- Styles (Giữ nguyên y hệt thiết kế trước) ---
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    fontFamily: "'Inter', sans-serif",
    color: "#232c51",
  },
  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 50,
    backgroundColor: "rgba(255,255,255,0.95)",
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
    width: "240px",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "14px",
    width: "100%",
    color: "#0f1419",
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
  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#e74c3c",
    color: "white",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: "bold",
  },

  mainLayout: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    gap: "24px",
    paddingTop: "80px",
    paddingLeft: "24px",
    paddingRight: "24px",
    height: "100vh",
    boxSizing: "border-box",
    paddingBottom: "20px",
  },
  leftSidebar: {
    width: "220px",
    flexShrink: 0,
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
    fontSize: "15px",
    fontWeight: 600,
  },

  messageBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex",
    overflow: "hidden",
  },
  convoList: {
    width: "340px",
    borderRight: "1px solid #eff3f4",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  convoHeader: {
    padding: "20px 20px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eff3f4",
  },
  iconBtnPrimary: {
    background: "#f0f2f5",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#0f1419",
  },

  listWrapper: { flex: 1, overflowY: "auto" },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  avatarWrap: { position: "relative", display: "inline-block" },
  convAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  onlineBadge: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "12px",
    height: "12px",
    backgroundColor: "#31a24c",
    borderRadius: "50%",
    border: "2px solid #fff",
  },
  convDetails: { flex: 1, minWidth: 0 },
  convTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "4px",
  },
  convPreviewRow: { display: "flex", alignItems: "center", gap: "6px" },
  convPreview: {
    fontSize: "13px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },

  chatWindow: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  chatHeader: {
    height: "72px",
    padding: "0 24px",
    borderBottom: "1px solid #eff3f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  iconBtnOutlined: {
    background: "transparent",
    border: "none",
    color: "#1877F2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    transition: "background 0.2s",
  },

  chatThread: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  msgWrapper: { display: "flex", gap: "12px", alignItems: "flex-end" },
  msgAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  bubbleIn: {
    backgroundColor: "#f0f2f5",
    color: "#0f1419",
    borderRadius: "18px 18px 18px 4px",
    padding: "12px 16px",
    fontSize: "15px",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },
  bubbleOut: {
    backgroundColor: "#1877F2",
    color: "#fff",
    borderRadius: "18px 18px 4px 18px",
    padding: "12px 16px",
    fontSize: "15px",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },
  // Bubble khi tin nhắn đã bị thu hồi
  bubbleRecalledIn: {
    backgroundColor: "transparent",
    color: "#9aa0b4",
    border: "1px dashed #c8cedf",
    borderRadius: "18px 18px 18px 4px",
    padding: "10px 14px",
    fontSize: "13px",
    fontStyle: "italic",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  bubbleRecalledOut: {
    backgroundColor: "transparent",
    color: "#9aa0b4",
    border: "1px dashed #c8cedf",
    borderRadius: "18px 18px 4px 18px",
    padding: "10px 14px",
    fontSize: "13px",
    fontStyle: "italic",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  // Nút 3 chấm hiện khi hover
  msgMenuBtn: {
    background: "#f0f2f5",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    marginBottom: "4px",
    color: "#536471",
    flexShrink: 0,
  },
  // Dropdown context menu
  contextMenu: {
    position: "absolute",
    top: "32px",
    right: 0,
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    zIndex: 100,
    minWidth: "180px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  contextMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "12px 16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#0f1419",
    textAlign: "left",
    transition: "background 0.15s",
  },
  // Edit inline styles
  editInputWrapper: {
    backgroundColor: "#fff",
    border: "2px solid #1877F2",
    borderRadius: "12px",
    padding: "10px 12px",
    minWidth: "220px",
    boxShadow: "0 2px 12px rgba(24,119,242,0.15)",
  },
  editInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "15px",
    color: "#0f1419",
    background: "transparent",
    boxSizing: "border-box",
  },
  editCancelBtn: {
    padding: "5px 14px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    background: "#f0f2f5",
    color: "#536471",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
  editSaveBtn: {
    padding: "5px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#1877F2",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
  msgMeta: {
    fontSize: "11px",
    color: "#6c759e",
    marginTop: "4px",
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },

  inputArea: {
    padding: "16px 24px",
    borderTop: "1px solid #eff3f4",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#fff",
  },
  inputIconBtn: {
    background: "transparent",
    border: "none",
    color: "#1877F2",
    cursor: "pointer",
    display: "flex",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
  },
  chatInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "15px",
    color: "#0f1419",
    padding: "4px 0",
  },
  emojiBtn: {
    background: "transparent",
    border: "none",
    color: "#1877F2",
    cursor: "pointer",
    display: "flex",
  },
  sendBtn: {
    background: "#e4e6eb",
    color: "#bcc0c4",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  sendBtnActive: {
    background: "#1877F2",
    color: "#fff",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.1s",
  },
  // Modal Styles
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
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #eff3f4",
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
  modalBody: { flex: 1, padding: 0 },
  friendItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #f9fafb",
    transition: "background 0.2s",
  },
  friendAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    objectFit: "cover",
  },
};
