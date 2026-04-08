import { getStoredUser } from "./storage";

export const getCurrentUser = (fallback = null) => {
  return getStoredUser(fallback);
};

export const getCurrentUserId = (user = getCurrentUser()) => {
  return user?._id || user?.id || null;
};
