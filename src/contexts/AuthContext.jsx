import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthToken, getAuthToken, setAuthToken } from "../services/apiClient";
import { changePasswordApi, getCurrentUserApi, loginAdminApi } from "../services/adminApi";

const AuthContext = createContext(null);

const STORAGE_KEY = "sanitarySolutionsUser";

const getStoredUser = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getAuthToken());
  const [authLoading, setAuthLoading] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    const syncCurrentUser = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const data = await getCurrentUserApi();
        setUser(data.user);
      } catch (error) {
        clearAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    syncCurrentUser();
  }, [token]);

  const login = async (role, username, password) => {
    try {
      if (role !== "admin") {
        return { success: false, message: "Only admin login is supported." };
      }

      const data = await loginAdminApi({ username, password });
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, role: data.user.role };
    } catch (error) {
      return { success: false, message: error.message || "Login failed." };
    }
  };

  const changeAdminPassword = async (currentPassword, newPassword) => {
    try {
      await changePasswordApi({ currentPassword, newPassword });
      return { success: true, message: "Admin password changed successfully." };
    } catch (error) {
      return { success: false, message: error.message || "Failed to change password." };
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      isAuthenticated: Boolean(user && token),
      login,
      changeAdminPassword,
      logout,
      hasRole: (role) => user?.role === role,
    }),
    [user, token, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
