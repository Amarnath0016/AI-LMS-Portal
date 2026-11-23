import axios from "axios";
import { API_URL } from "@/constants";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 402 ||
      error.response?.data?.code === "SUBSCRIPTION_REQUIRED"
    ) {
      const courseId = error.response?.data?.courseId;
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/subscribe")
      ) {
        const dest = courseId ? `/subscribe?course=${courseId}` : "/subscribe";
        window.location.href = dest;
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
