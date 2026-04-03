import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { getStoredUser } from "../utils/storage";

const LeftSidebar = ({ style }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(getStoredUser({}));

  const activeTab = location.pathname;

  useEffect(() => {
    const resolveRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const hasRoleName =
        currentUser?.roleName ||
        currentUser?.role?.name ||
        currentUser?.roleId?.name ||
        typeof currentUser?.role === "string";

      if (hasRoleName) return;

      try {
        const res = await API.get("/auth/me");
        if (res.data?.success && res.data?.data) {
          const me = res.data.data;
          const roleName =
            me?.roleName ||
            me?.role?.name ||
            me?.roleId?.name ||
            me?.role ||
            "user";

          const syncedUser = {
            ...me,
            id: me._id,
            roleName,
            role: roleName,
          };

          localStorage.setItem("user", JSON.stringify(syncedUser));
          setCurrentUser(syncedUser);
        }
      } catch (error) {
        console.error("Không thể đồng bộ role cho sidebar", error);
      }
    };

    resolveRole();
  }, [currentUser]);

  const normalizedRole = useMemo(() => {
    return (
      currentUser?.roleName ||
      currentUser?.role?.name ||
      currentUser?.roleId?.name ||
      currentUser?.role ||
      "user"
    )
      .toString()
      .toLowerCase();
  }, [currentUser]);

  const menuItems = useMemo(() => {
    const baseItems = [
      { icon: "home", label: "Trang chủ", path: "/" },
      { icon: "group", label: "Bạn bè", path: "/friends" },
      { icon: "person", label: "Hồ sơ", path: "/profile" },
      { icon: "message", label: "Tin nhắn", path: "/messages" },
      { icon: "settings", label: "Cài đặt", path: "/settings" },
    ];

    if (normalizedRole === "admin") {
      return [
        ...baseItems,
        {
          icon: "admin_panel_settings",
          label: "Admin Dashboard",
          path: "/admin",
        },
        { icon: "gavel", label: "Moderator Hub", path: "/moderator" },
      ];
    }

    if (normalizedRole === "moderator") {
      return [
        ...baseItems,
        { icon: "gavel", label: "Moderator Hub", path: "/moderator" },
      ];
    }

    return baseItems;
  }, [normalizedRole]);

  return (
    <aside style={{ ...styles.leftSidebar, ...style }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/profile")}
      >
        <img
          src={currentUser?.avatarUrl || "https://via.placeholder.com/150"}
          alt="Me"
          style={styles.profileImg}
        />
        <div>
          <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
            {currentUser?.username || "Người dùng"}
          </p>
          <p style={{ fontSize: "12px", color: "#6c759e", margin: 0 }}>
            @{currentUser?.username?.toLowerCase() || "user"}
          </p>
        </div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {menuItems.map((item) => {
          const isActive =
            activeTab === item.path ||
            (item.path !== "/" && activeTab.startsWith(item.path));

          return (
            <a
              key={item.icon}
              href={item.path}
              style={{
                ...styles.navLink,
                backgroundColor: isActive ? "#1877F2" : "transparent",
                color: isActive ? "#fff" : "#6c759e",
              }}
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
          );
        })}
      </nav>
    </aside>
  );
};

const styles = {
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
    fontSize: "15px",
    fontWeight: 600,
    transition: "background 0.2s, color 0.2s",
  },
};

export default LeftSidebar;
