import { useCallback, useState } from "react";
import { getUsers, assignRole, deleteUser } from "../services/admin.service";

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const refreshUsers = useCallback(async (limit = 100) => {
    try {
      setLoading(true);
      const res = await getUsers(limit);
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
  }, []);

  const handleRoleChange = useCallback(async (userId, nextRole) => {
    try {
      const res = await assignRole(userId, nextRole);
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
  }, []);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa vĩnh viễn tài khoản này?")) {
      return;
    }

    try {
      const res = await deleteUser(userId);
      if (res.data?.success) {
        setUsers((prev) => prev.filter((user) => user._id !== userId));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Xóa người dùng thất bại");
    }
  }, []);

  return {
    users,
    loading,
    message,
    refreshUsers,
    handleRoleChange,
    handleDeleteUser,
  };
};
