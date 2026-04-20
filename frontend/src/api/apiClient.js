import axios from "axios";

// 🔹 Base API instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8001",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});


// 🔹 REQUEST INTERCEPTOR (attach token + timing)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ⏱ start timer
    config.metadata = { startTime: new Date() };

    console.log(
      `➡️ REQUEST: ${config.method?.toUpperCase()} ${config.url}`
    );

    return config;
  },
  (error) => Promise.reject(error)
);


// 🔹 RESPONSE INTERCEPTOR (log success + timing)
API.interceptors.response.use(
  (response) => {
    const duration =
      new Date() - response.config.metadata.startTime;

    console.log(
      `✅ RESPONSE: ${response.config.url} (${duration} ms)`
    );

    return response;
  },
  (error) => {
    const duration =
      new Date() - error.config?.metadata?.startTime;

    console.log(
      `❌ FAILED: ${error.config?.url} (${duration} ms)`
    );

    const status = error?.response?.status;

    console.error("API ERROR:", {
      message: error.message,
      status,
      url: error?.config?.url,
    });

    if (status === 401) {
      console.warn("Unauthorized — redirect user");
    }

    if (status === 404) {
      console.warn("Resource not found");
    }

    if (status === 500) {
      console.error("Server error — check backend");
    }

    // 🔥 Retry once on timeout
    if (error.code === "ECONNABORTED") {
      console.warn("⏳ Timeout — retrying once...");

      return API.request(error.config);
    }

    return Promise.reject(error);
  }
);

export default API;