import React, { createContext, useState, useContext, useEffect } from "react";
import API from "../api/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // 🔹 Check if user is already logged in (on app load)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsLoadingAuth(false);
          return;
        }

        // attach token
        API.defaults.headers.Authorization = `Bearer ${token}`;

        // 🔹 call backend (we'll build this later)
        const res = await API.get("/auth/me");

        setUser(res.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();
  }, []);

  // 🔹 Login
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // save token
      localStorage.setItem("token", token);

      // attach token globally
      API.defaults.headers.Authorization = `Bearer ${token}`;

      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error };
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    delete API.defaults.headers.Authorization;

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};