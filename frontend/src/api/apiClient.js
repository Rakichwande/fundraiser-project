import axios from "axios";

// 🔹 Base URL (from .env for flexibility)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Request Interceptor (attach token later)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // future use

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response Interceptor (global error handling)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    console.error("API ERROR:", error?.response || error.message);

    if (status === 401) {
      console.warn("Unauthorized — login required");
    }

    if (status === 404) {
      console.warn("Resource not found");
    }

    if (status === 500) {
      console.error("Server error — check FastAPI backend");
    }

    return Promise.reject(error);
  }
);

export default API;