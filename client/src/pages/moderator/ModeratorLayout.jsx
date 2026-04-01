import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import DashboardTopNavbar from "../../components/DashboardTopNavbar";
import "../dashboard.css";

const ModeratorLayout = () => {
  return (
    <div className="dashboard-shell">
      <DashboardTopNavbar role="moderator" />

      <div className="dashboard-grid">
        <aside className="dashboard-panel dashboard-side">
          <span className="dashboard-badge">Moderator Hub</span>
          <h1 className="dashboard-title">Điều phối cộng đồng</h1>
          <p className="dashboard-subtitle">
            Tập trung vào Reports và công cụ xử lý để vận hành ổn định theo từng
            module.
          </p>

          <nav className="dashboard-nav" style={{ marginTop: 14 }}>
            <NavLink
              to="reports"
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

export default ModeratorLayout;
