import { NavLink, Outlet } from "react-router-dom";
import DashboardTopNavbar from "../../components/DashboardTopNavbar";
import BackButton from "../../components/BackButton";
import "../dashboard.css";

const AdminLayout = () => {
  return (
    <div className="dashboard-shell">
      <DashboardTopNavbar role="admin" />

      <div className="dashboard-grid">
        <aside className="dashboard-panel dashboard-side">
          <BackButton />
          <span className="dashboard-badge">Admin Dashboard</span>
          <h1 className="dashboard-title">Quản trị hệ thống</h1>
          <p className="dashboard-subtitle">
            Chia nhỏ theo module để dễ mở rộng production và phân quyền theo
            chức năng.
          </p>

          <nav className="dashboard-nav" style={{ marginTop: 14 }}>
            <NavLink
              to="settings"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "dashboard-nav-link-active" : ""}`
              }
            >
              Settings
            </NavLink>
            <NavLink
              to="users"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "dashboard-nav-link-active" : ""}`
              }
            >
              Users
            </NavLink>
            <NavLink
              to="/moderator/reports"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "dashboard-nav-link-active" : ""}`
              }
            >
              Reports
            </NavLink>
          </nav>
        </aside>

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
