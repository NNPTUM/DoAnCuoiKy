import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Cấu hình Interceptor: Tự động đính kèm token vào Header trước khi gửi request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default API;
