import React, { useEffect, useMemo } from "react";
import "../dashboard.css";
import { getCurrentUser, getCurrentUserId } from "../../utils/authUser";
import { roleName } from "../../utils/role";
import { useAdminUsers } from "../../hooks/useAdminUsers";

const AdminUsersPage = () => {
  const currentUser = getCurrentUser({});
  const currentUserId = getCurrentUserId(currentUser);
  const {
    users,
    loading,
    message,
    refreshUsers,
    handleRoleChange,
    handleDeleteUser,
  } = useAdminUsers();

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => roleName(u) === "admin").length,
      moderators: users.filter((u) => roleName(u) === "moderator").length,
      members: users.filter((u) => roleName(u) === "user").length,
    };
  }, [users]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return (
    <section className="dashboard-panel dashboard-content-card">
      <div className="section-row">
        <h2 className="section-title">Users</h2>
        <button className="ghost-btn" onClick={refreshUsers}>
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
                const isCurrentUser = user._id === currentUserId;
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
