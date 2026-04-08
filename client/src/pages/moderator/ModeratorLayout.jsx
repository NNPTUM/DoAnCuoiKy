import React from "react";
import { Outlet } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import "../dashboard.css";

const ModeratorLayout = () => {
  return (
    <DashboardShell
      role="moderator"
      badge="Moderator Hub"
      title="Điều phối cộng đồng"
      subtitle="Tập trung vào Reports và công cụ xử lý để vận hành ổn định theo từng module."
      navItems={[{ to: "reports", label: "Reports" }]}
    >
      <Outlet />
    </DashboardShell>
  );
};

export default ModeratorLayout;
