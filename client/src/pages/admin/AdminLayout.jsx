import { Outlet } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import "../dashboard.css";

const AdminLayout = () => {
  return (
    <DashboardShell
      role="admin"
      badge="Admin Dashboard"
      title="Quản trị hệ thống"
      subtitle="Chia nhỏ theo module để dễ mở rộng production và phân quyền theo chức năng."
      showBackButton={true}
      navItems={[
        { to: "settings", label: "Settings" },
        { to: "users", label: "Users" },
        { to: "/moderator/reports", label: "Reports" },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
};

export default AdminLayout;
