export const roleName = (user) => {
  return user?.roleId?.name || user?.roleName || user?.role || "user";
};
