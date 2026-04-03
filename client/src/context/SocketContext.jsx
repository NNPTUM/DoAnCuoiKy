import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";
import API from "../api/axios";
import { getStoredUser } from "../utils/storage";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = async () => {
    try {
      const res = await API.get("/connections/requests/pending");
      if (res.data.success) {
        setPendingCount(res.data.data.length);
      }
    } catch (error) {
      console.error("Lỗi lấy thông báo lời mời kết bạn:", error);
    }
  };

  const connectSocket = () => {
    const currentUser = getStoredUser();
    if (!currentUser) return null;

    const currentUserId = currentUser.id || currentUser._id;
    const newSocket = io(`http://${window.location.hostname}:5000`);

    newSocket.on("connect", () => {
      console.log("[Socket] ✅ Kết nối thành công, socketId:", newSocket.id);
      newSocket.emit("addUser", currentUserId);
      console.log("[Socket] 🚀 Đã emit addUser, userId:", currentUserId);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("[Socket] ⚠️ Ngắt kết nối, lý do:", reason);
    });

    newSocket.on("reconnect", () => {
      console.log("[Socket] 🔄 Reconnect thành công, re-emit addUser");
      newSocket.emit("addUser", currentUserId);
    });

    newSocket.on("getOnlineUsers", (users) => {
      console.log(
        "[Socket] 🌍 Online users:",
        users.map((u) => u.userId),
      );
      setOnlineUsers(users);
    });

    newSocket.on("newNotification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setToastMessage(data.message);
      setTimeout(() => setToastMessage(null), 4000);
    });

    newSocket.on("pendingFriendRequestCount", () => {
      fetchPendingCount();
    });

    return newSocket;
  };

  useEffect(() => {
    fetchPendingCount();

    // Tạo socket lần đầu nếu đã đăng nhập
    const initialSocket = connectSocket();
    if (initialSocket) setSocket(initialSocket);

    // Lắng nghe sự kiện "userLoggedIn" khi user vừa đăng nhập
    const handleUserLoggedIn = () => {
      // Ngắt socket cũ nếu có
      setSocket((prevSocket) => {
        if (prevSocket) prevSocket.disconnect();
        return null;
      });
      fetchPendingCount();
      const newSock = connectSocket();
      if (newSock) setSocket(newSock);
    };

    window.addEventListener("userLoggedIn", handleUserLoggedIn);

    return () => {
      window.removeEventListener("userLoggedIn", handleUserLoggedIn);
      setSocket((prevSocket) => {
        if (prevSocket) prevSocket.disconnect();
        return null;
      });
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        notifications,
        toastMessage,
        pendingCount,
        setPendingCount,
      }}
    >
      {children}
      {/* Toast Notification Đơn giản */}
      {toastMessage && (
        <div style={styles.toast}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#1877F2", marginRight: "8px" }}
          >
            info
          </span>
          {toastMessage}
        </div>
      )}
    </SocketContext.Provider>
  );
};

const styles = {
  toast: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    backgroundColor: "#fff",
    color: "#0f1419",
    padding: "16px 24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "14px",
    animation: "slideIn 0.3s ease-out forwards",
  },
};
