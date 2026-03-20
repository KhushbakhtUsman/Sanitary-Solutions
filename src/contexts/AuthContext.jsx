import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthToken, getAuthToken, setAuthToken } from "../services/apiClient";
import { changePasswordApi, getCurrentUserApi, loginAdminApi } from "../services/adminApi";
import {
  changeCustomerPasswordApi,
  customerLoginApi,
  customerSignupApi,
  getCurrentCustomerApi,
  updateCurrentCustomerApi,
} from "../services/storeApi";

const AuthContext = createContext(null);

const ADMIN_USER_STORAGE_KEY = "sanitarySolutionsAdminUser";
const CUSTOMER_USER_STORAGE_KEY = "sanitarySolutionsCustomerUser";

const getStoredUser = (storageKey) => {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

const persistStoredUser = (storageKey, user) => {
  if (user) {
    localStorage.setItem(storageKey, JSON.stringify(user));
  } else {
    localStorage.removeItem(storageKey);
  }
};

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => getStoredUser(ADMIN_USER_STORAGE_KEY));
  const [customerUser, setCustomerUser] = useState(() => getStoredUser(CUSTOMER_USER_STORAGE_KEY));
  const [adminToken, setAdminToken] = useState(() => getAuthToken("admin"));
  const [customerToken, setCustomerToken] = useState(() => getAuthToken("customer"));
  const [authLoading, setAuthLoading] = useState(Boolean(getAuthToken("admin") || getAuthToken("customer")));

  useEffect(() => {
    persistStoredUser(ADMIN_USER_STORAGE_KEY, adminUser);
  }, [adminUser]);

  useEffect(() => {
    persistStoredUser(CUSTOMER_USER_STORAGE_KEY, customerUser);
  }, [customerUser]);

  useEffect(() => {
    let cancelled = false;

    const syncAdminSession = async () => {
      if (!adminToken) {
        if (!cancelled) {
          setAdminUser(null);
        }
        return;
      }

      try {
        const data = await getCurrentUserApi();
        if (!cancelled) {
          setAdminUser(data.user);
        }
      } catch (error) {
        if (!cancelled) {
          clearAuthToken("admin");
          setAdminToken(null);
          setAdminUser(null);
        }
      }
    };

    const syncCustomerSession = async () => {
      if (!customerToken) {
        if (!cancelled) {
          setCustomerUser(null);
        }
        return;
      }

      try {
        const data = await getCurrentCustomerApi();
        if (!cancelled) {
          setCustomerUser(data.user);
        }
      } catch (error) {
        if (!cancelled) {
          clearAuthToken("customer");
          setCustomerToken(null);
          setCustomerUser(null);
        }
      }
    };

    const syncSessions = async () => {
      if (!adminToken && !customerToken) {
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      await Promise.all([syncAdminSession(), syncCustomerSession()]);
      if (!cancelled) {
        setAuthLoading(false);
      }
    };

    syncSessions();

    return () => {
      cancelled = true;
    };
  }, [adminToken, customerToken]);

  const isRoleAuthenticated = (role) => {
    if (role === "admin") {
      return Boolean(adminToken && adminUser);
    }
    if (role === "customer") {
      return Boolean(customerToken && customerUser);
    }
    return false;
  };

  const login = async (role, identifier, password) => {
    try {
      if (role === "admin") {
        const data = await loginAdminApi({ username: identifier, password });
        setAuthToken(data.token, "admin");
        setAdminToken(data.token);
        setAdminUser(data.user);
        return { success: true, role: data.user.role };
      }

      if (role === "customer") {
        const data = await customerLoginApi({ email: identifier, password });
        setAuthToken(data.token, "customer");
        setCustomerToken(data.token);
        setCustomerUser(data.user);
        return { success: true, role: data.user.role };
      }

      return { success: false, message: "Unsupported login role." };
    } catch (error) {
      return { success: false, message: error.message || "Login failed." };
    }
  };

  const signupCustomer = async (payload) => {
    try {
      const data = await customerSignupApi(payload);
      setAuthToken(data.token, "customer");
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      return { success: true, role: data.user.role };
    } catch (error) {
      return { success: false, message: error.message || "Signup failed." };
    }
  };

  const changeAdminPassword = async (currentPassword, newPassword) => {
    if (!isRoleAuthenticated("admin")) {
      return { success: false, message: "Only admin can change this password." };
    }

    try {
      await changePasswordApi({ currentPassword, newPassword });
      return { success: true, message: "Admin password changed successfully." };
    } catch (error) {
      return { success: false, message: error.message || "Failed to change password." };
    }
  };

  const updateCustomerProfile = async (payload) => {
    if (!isRoleAuthenticated("customer")) {
      return { success: false, message: "Only customer can update this profile." };
    }

    try {
      const data = await updateCurrentCustomerApi(payload);
      setCustomerUser(data.user);
      return { success: true, user: data.user, message: "Profile updated successfully." };
    } catch (error) {
      return { success: false, message: error.message || "Failed to update profile." };
    }
  };

  const changeCustomerPassword = async (currentPassword, newPassword) => {
    if (!isRoleAuthenticated("customer")) {
      return { success: false, message: "Only customer can change this password." };
    }

    try {
      await changeCustomerPasswordApi({ currentPassword, newPassword });
      return { success: true, message: "Password changed successfully." };
    } catch (error) {
      return { success: false, message: error.message || "Failed to change password." };
    }
  };

  const logout = (role) => {
    if (role === "admin") {
      clearAuthToken("admin");
      setAdminToken(null);
      setAdminUser(null);
      return;
    }

    if (role === "customer") {
      clearAuthToken("customer");
      setCustomerToken(null);
      setCustomerUser(null);
      return;
    }

    clearAuthToken();
    setAdminToken(null);
    setAdminUser(null);
    setCustomerToken(null);
    setCustomerUser(null);
  };

  const value = useMemo(
    () => ({
      user: customerUser,
      token: customerToken,
      adminUser,
      customerUser,
      adminToken,
      customerToken,
      authLoading,
      isAuthenticated: Boolean(isRoleAuthenticated("admin") || isRoleAuthenticated("customer")),
      isRoleAuthenticated,
      login,
      signupCustomer,
      changeAdminPassword,
      updateCustomerProfile,
      changeCustomerPassword,
      logout,
      hasRole: (role) => isRoleAuthenticated(role),
      getUserByRole: (role) => (role === "admin" ? adminUser : role === "customer" ? customerUser : null),
    }),
    [adminUser, customerUser, adminToken, customerToken, authLoading]
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
