import { NavLink } from "react-router-dom";
import DashboardTopNavbar from "./DashboardTopNavbar";
import BackButton from "./BackButton";

const DashboardShell = ({
  role,
  badge,
  title,
  subtitle,
  navItems,
  showBackButton = false,
  children,
}) => {
  return (
    <div className="dashboard-shell">
      <DashboardTopNavbar role={role} />

      <div className="dashboard-grid">
        <aside className="dashboard-panel dashboard-side">
          {showBackButton && <BackButton />}
          <span className="dashboard-badge">{badge}</span>
          <h1 className="dashboard-title">{title}</h1>
          <p className="dashboard-subtitle">{subtitle}</p>

          <nav className="dashboard-nav" style={{ marginTop: 14 }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `dashboard-nav-link ${isActive ? "dashboard-nav-link-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
};

export default DashboardShell;
