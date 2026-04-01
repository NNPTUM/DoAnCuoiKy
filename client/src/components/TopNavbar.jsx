import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import API from "../api/axios";

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
};

const TopNavbar = ({
  homePath = "/",
  profilePath = "/profile",
  notificationsPath = "/friends",
  showSearch = true,
  showNotifications = true,
  brandLabel = "Social Web",
}) => {
  const navigate = useNavigate();
  const socketState = useSocket();
  const pendingCount = socketState?.pendingCount || 0;
  const currentUser = getStoredUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!showSearch) {
      setSearchResults([]);
      setShowResults(false);
      return undefined;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() !== "") {
        try {
          const res = await API.get(`/auth/search?q=${searchTerm}`);
          if (res.data.success) {
            setSearchResults(res.data.data);
            setShowResults(true);
          }
        } catch (error) {
          console.error("Lỗi tìm kiếm:", error);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, showSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav style={styles.navbar}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <span
          onClick={() => navigate(homePath)}
          style={{ ...styles.logo, cursor: "pointer" }}
        >
          {brandLabel}
        </span>

        {showSearch && (
          <div
            style={{ ...styles.searchBar, position: "relative" }}
            ref={searchRef}
          >
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm) setShowResults(true);
              }}
            />

            {showResults && (
              <div style={styles.dropdown}>
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user._id}
                      style={styles.dropdownItem}
                      onClick={() => {
                        setShowResults(false);
                        setSearchTerm("");
                        navigate(`/profile/${user._id}`);
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f0f2f5")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <img
                        src={
                          user.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${user.username}`
                        }
                        alt={user.username}
                        style={styles.dropdownAvatar}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0f1419",
                        }}
                      >
                        {user.username}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={styles.dropdownEmpty}>Không tìm thấy kết quả</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {showNotifications && (
          <div
            style={{
              position: "relative",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => navigate(notificationsPath)}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "28px", color: "#6c759e" }}
            >
              notifications
            </span>
            {pendingCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                {pendingCount}
              </span>
            )}
          </div>
        )}

        <img
          src={
            currentUser?.avatarUrl ||
            `https://ui-avatars.com/api/?name=${currentUser?.username || "User"}`
          }
          alt="Profile"
          style={{ ...styles.navAvatar, cursor: "pointer" }}
          onClick={() => navigate(profilePath)}
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
  );
};

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    width: "auto",
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
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    overflow: "hidden",
    zIndex: 100,
    maxHeight: "300px",
    overflowY: "auto",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f0f2f5",
    transition: "background-color 0.2s ease",
  },
  dropdownAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  dropdownEmpty: {
    padding: "12px 16px",
    color: "#6c759e",
    textAlign: "center",
    fontSize: "14px",
  },
};

export default TopNavbar;
