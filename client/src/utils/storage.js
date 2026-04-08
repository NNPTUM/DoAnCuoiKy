export const getStoredJSON = (key, fallback = null) => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Invalid JSON in localStorage key: ${key}`);
    localStorage.removeItem(key);
    return fallback;
  }
};

export const getStoredUser = (fallback = null) => {
  return getStoredJSON("user", fallback);
};
