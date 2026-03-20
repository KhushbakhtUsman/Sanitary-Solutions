export const AUTH_TOKEN_KEY = "sanitarySolutionsToken";
export const ADMIN_AUTH_TOKEN_KEY = "sanitarySolutionsAdminToken";
export const CUSTOMER_AUTH_TOKEN_KEY = "sanitarySolutionsCustomerToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const getTokenKeyByRole = (role = "admin") =>
  role === "customer" ? CUSTOMER_AUTH_TOKEN_KEY : ADMIN_AUTH_TOKEN_KEY;

const migrateLegacyToken = (role = "admin") => {
  if (typeof window === "undefined") return null;
  const legacy = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!legacy) return null;

  const roleKey = getTokenKeyByRole(role);
  if (!localStorage.getItem(roleKey) && role === "admin") {
    localStorage.setItem(roleKey, legacy);
  }

  return legacy;
};

export const getAuthToken = (role = "admin") => {
  const roleKey = getTokenKeyByRole(role);
  const roleToken = localStorage.getItem(roleKey);
  if (roleToken) return roleToken;

  if (role === "admin") {
    return migrateLegacyToken("admin");
  }

  return null;
};

export const setAuthToken = (token, role = "admin") => {
  localStorage.setItem(getTokenKeyByRole(role), token);
  if (role === "admin") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const clearAuthToken = (role) => {
  if (!role || role === "admin") {
    localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  if (!role || role === "customer") {
    localStorage.removeItem(CUSTOMER_AUTH_TOKEN_KEY);
  }
};

const readJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const apiRequest = async (
  path,
  { method = "GET", body, auth = false, authRole = "admin", headers } = {}
) => {
  const requestHeaders = {
    ...(headers || {}),
  };

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAuthToken(authRole);
    if (!token) {
      throw new Error(`${authRole === "customer" ? "Customer" : "Admin"} authentication required`);
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await readJsonSafely(response);

  if (!response.ok) {
    throw new Error(json?.message || `Request failed with status ${response.status}`);
  }

  return json;
};
