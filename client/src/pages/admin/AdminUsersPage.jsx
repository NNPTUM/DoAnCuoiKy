import React, { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import "../dashboard.css";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
};

const roleName = (user) =>
  user?.roleId?.name || user?.roleName || user?.role || "user";

const AdminUsersPage = () => {
  const currentUser = getStoredUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => roleName(u) === "admin").length,
      moderators: users.filter((u) => roleName(u) === "moderator").length,
      members: users.filter((u) => roleName(u) === "user").length,
    };
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users?limit=100");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setUsers(res.data.data);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Không thể tải danh sách người dùng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  return (
    <section className="dashboard-panel dashboard-content-card">
      <div className="section-row">
        <h2 className="section-title">Users</h2>
        <button className="ghost-btn" onClick={fetchUsers}>
          Tải lại
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-label">Tổng user</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Moderator</div>
          <div className="stat-value">{stats.moderators}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Admin</div>
          <div className="stat-value">{stats.admins}</div>
        </div>
      </div>

      {loading ? (
        <div className="helper-text">Đang tải danh sách người dùng...</div>
      ) : (
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
                const isCurrentUser =
                  user._id === currentUser?._id || user._id === currentUser?.id;
                return (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={userRole}
                        disabled={isCurrentUser}
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
                        disabled={isCurrentUser}
                        title={
                          isCurrentUser
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
      )}

      {message && (
        <p className="helper-text" style={{ marginTop: 10 }}>
          {message}
        </p>
      )}
      <p className="helper-text" style={{ marginTop: 6 }}>
        User thường: {stats.members}
      </p>
    </section>
  );
};

export default AdminUsersPage;
