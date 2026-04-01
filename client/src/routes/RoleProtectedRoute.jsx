import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import API from "../api/axios";

const resolveRoleName = (userData) => {
  return (
    userData?.roleName ||
    userData?.role?.name ||
    userData?.role ||
    userData?.roleId?.name ||
    ""
  )
    .toString()
    .toLowerCase();
};

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    loading: true,
    isAuthenticated: false,
    roleName: "",
  });

  const normalizedAllowedRoles = useMemo(
    () => allowedRoles.map((role) => role.toLowerCase()),
    [allowedRoles],
  );

  useEffect(() => {
    const checkPermission = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthState({ loading: false, isAuthenticated: false, roleName: "" });
        return;
      }

      try {
        const res = await API.get("/auth/me");
        if (!res.data?.success || !res.data?.data) {
          throw new Error("Không thể lấy thông tin người dùng");
        }

        const me = res.data.data;
        const roleName = resolveRoleName(me);

        // Đồng bộ localStorage để các component khác (sidebar/navbar) dùng nhất quán
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...me,
            id: me._id,
            roleName,
            role: roleName,
          }),
        );

        setAuthState({ loading: false, isAuthenticated: true, roleName });
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState({ loading: false, isAuthenticated: false, roleName: "" });
      }
    };

    checkPermission();
  }, []);

  if (authState.loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Manrope, Segoe UI, sans-serif",
          background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)",
          color: "#1f2a44",
          fontWeight: 700,
        }}
      >
        Đang xác thực quyền truy cập...
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!normalizedAllowedRoles.includes(authState.roleName)) {
    return (
      <Navigate
        to="/403"
        replace
        state={{
          from: location.pathname,
          requiredRoles: normalizedAllowedRoles,
          currentRole: authState.roleName,
        }}
      />
    );
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
