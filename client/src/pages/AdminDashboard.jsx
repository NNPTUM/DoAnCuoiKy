import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import DashboardTopNavbar from "../components/DashboardTopNavbar";
import "./dashboard.css";
import { getStoredUser } from "../utils/storage";

const initialSettings = {
  features: {
    isImageCommentEnabled: true,
    isRegistrationEnabled: true,
  },
  algorithms: {
    newsfeedAlgorithm: "chronological",
    friendSuggestionLimit: 10,
  },
  ads: {
    isAdsEnabled: false,
    adFrequency: 5,
  },
};

const roleName = (user) =>
  user?.roleId?.name || user?.roleName || user?.role || "user";

const AdminDashboard = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const currentUser = getStoredUser({});

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter((u) => roleName(u) === "admin").length;
    const moderatorCount = users.filter(
      (u) => roleName(u) === "moderator",
    ).length;
    const normalCount = users.filter((u) => roleName(u) === "user").length;

    return { totalUsers, adminCount, moderatorCount, normalCount };
  }, [users]);

  const fetchBootstrap = async () => {
    try {
      setLoading(true);
      const [settingsRes, usersRes] = await Promise.all([
        API.get("/admin/settings"),
        API.get("/admin/users?limit=100"),
      ]);

      if (settingsRes.data?.success && settingsRes.data?.data) {
        setSettings((prev) => ({ ...prev, ...settingsRes.data.data }));
      }

      if (usersRes.data?.success && Array.isArray(usersRes.data?.data)) {
        setUsers(usersRes.data.data);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Không thể tải dữ liệu Admin",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBootstrap();
  }, []);

  const toggleFeature = (featureKey) => {
    setSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey],
      },
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage("");
      const res = await API.put("/admin/settings", settings);
      if (res.data?.success) {
        setMessage("Đã lưu cấu hình hệ thống thành công.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Lưu cấu hình thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    try {
      const res = await API.put(`/admin/users/${userId}/role`, {
        roleName: nextRole,
      });

      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  roleId: {
                    ...(typeof user.roleId === "object" ? user.roleId : {}),
                    name: nextRole,
                  },
                }
              : user,
          ),
        );
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể đổi role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa vĩnh viễn tài khoản này?")) {
      return;
    }

    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data?.success) {
        setUsers((prev) => prev.filter((user) => user._id !== userId));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Xóa người dùng thất bại");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-shell">
        <DashboardTopNavbar role="admin" />
        <div style={{ maxWidth: "1220px", margin: "0 auto", fontWeight: 700 }}>
          Đang tải bảng điều khiển Admin...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <DashboardTopNavbar role="admin" />

      <div className="dashboard-grid">
        <aside className="dashboard-panel dashboard-side">
          <span className="dashboard-badge">Admin Console</span>
          <h1 className="dashboard-title">Bảng điều khiển hệ thống</h1>
          <p className="dashboard-subtitle">
            Bật tắt tính năng, quản lý phân quyền và điều phối vận hành toàn bộ
            nền tảng.
          </p>

          <div style={{ marginTop: 16 }} className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Tổng người dùng</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Moderator</div>
              <div className="stat-value">{stats.moderatorCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Admin</div>
              <div className="stat-value">{stats.adminCount}</div>
            </div>
          </div>
        </aside>

        <main className="dashboard-main dashboard-panel">
          <section>
            <div className="section-row">
              <h2 className="section-title">Thiết lập tính năng</h2>
              <button
                className="primary-btn"
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>

            <div className="setting-list">
              {[
                ["isImageCommentEnabled", "Comment bằng hình ảnh"],
                ["isRegistrationEnabled", "Cho phép đăng ký tài khoản"],
              ].map(([key, label]) => (
                <div className="setting-item" key={key}>
                  <div>
                    <strong>{label}</strong>
                  </div>
                  <button
                    className={`switch ${settings.features?.[key] ? "switch-on" : "switch-off"}`}
                    onClick={() => toggleFeature(key)}
                    aria-label={label}
                  />
                </div>
              ))}
            </div>
          </section>

          <section
            className="dashboard-panel"
            style={{ padding: 12, borderRadius: 12 }}
          >
            <div className="section-row">
              <h2 className="section-title">Thuật toán & Quảng cáo</h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <label>
                Thuật toán Newfeed
                <select
                  value={
                    settings.algorithms?.newsfeedAlgorithm || "chronological"
                  }
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      algorithms: {
                        ...prev.algorithms,
                        newsfeedAlgorithm: e.target.value,
                      },
                    }))
                  }
                >
                  <option value="chronological">Chronological</option>
                  <option value="engagement">Engagement</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label>

              <label>
                Giới hạn gợi ý kết bạn mỗi lần
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.algorithms?.friendSuggestionLimit || 10}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      algorithms: {
                        ...prev.algorithms,
                        friendSuggestionLimit: Number(e.target.value),
                      },
                    }))
                  }
                />
              </label>

              <label>
                Tần suất quảng cáo (sau bao nhiêu bài viết)
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.ads?.adFrequency || 5}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ads: {
                        ...prev.ads,
                        adFrequency: Number(e.target.value),
                      },
                    }))
                  }
                />
              </label>
            </div>
          </section>

          <section>
            <div className="section-row">
              <h2 className="section-title">Quản lý vai trò người dùng</h2>
              <span className="helper-text">
                Bạn đang đăng nhập: {currentUser.username || "Admin"}
              </span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const userRole = roleName(user);
                    return (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={userRole}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          {user.status || (user.isActive ? "active" : "banned")}
                        </td>
                        <td>
                          <button
                            className="danger-btn"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user._id === currentUser._id}
                            title={
                              user._id === currentUser._id
                                ? "Không thể tự xóa tài khoản"
                                : "Xóa tài khoản"
                            }
                          >
                            Xóa vĩnh viễn
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="helper-text" style={{ marginTop: 8 }}>
              Số lượng user thường: {stats.normalCount}
            </div>
          </section>

          {message && (
            <div
              style={{
                background: "#edf8ff",
                color: "#174581",
                borderRadius: 10,
                border: "1px solid #cbe0ff",
                padding: "10px 12px",
                fontWeight: 600,
              }}
            >
              {message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
