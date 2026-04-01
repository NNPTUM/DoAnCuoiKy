import React from "react";
import TopNavbar from "./TopNavbar";

const DashboardTopNavbar = ({ role = "admin" }) => {
  const normalizedRole = role.toLowerCase();

  const isAdmin = normalizedRole === "admin";

  return (
    <TopNavbar
      brandLabel={isAdmin ? "Admin Console" : "Moderator Hub"}
      homePath={isAdmin ? "/admin" : "/moderator"}
      profilePath="/profile"
      notificationsPath="/friends"
      showSearch={false}
      showNotifications={true}
    />
  );
};

export default DashboardTopNavbar;
