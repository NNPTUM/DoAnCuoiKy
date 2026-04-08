import API from "../api/axios";

export const getUsers = (limit = 100) => {
  return API.get(`/admin/users?limit=${limit}`);
};

export const assignRole = (userId, roleName) => {
  return API.put(`/admin/users/${userId}/role`, { roleName });
};

export const deleteUser = (userId) => {
  return API.delete(`/admin/users/${userId}`);
};

export const getSettings = () => {
  return API.get("/admin/settings");
};

export const updateSettings = (settings) => {
  return API.put("/admin/settings", settings);
};
