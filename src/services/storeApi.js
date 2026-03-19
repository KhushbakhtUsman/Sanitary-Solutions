import { apiRequest } from "./apiClient";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

const normalizeProduct = (product) => ({
  ...product,
  id: product._id || product.legacyId || product.id,
});

const unwrap = (response) => response?.data;

export const getStoreProductsApi = async (params = {}) => {
  const response = await apiRequest(`/products${buildQueryString(params)}`);
  const products = (unwrap(response) || []).map(normalizeProduct);
  return {
    data: products,
    meta: response?.meta || null,
  };
};

export const getStoreProductByIdApi = async (id) => {
  const response = await apiRequest(`/products/${id}`);
  const product = unwrap(response);
  return normalizeProduct(product);
};

export const getStoreProductMetaApi = async () => {
  const response = await apiRequest("/products/meta");
  return unwrap(response) || { categories: ["All"], brands: ["All"] };
};

export const createQuoteRequestApi = async (payload) => {
  const response = await apiRequest("/quotes", {
    method: "POST",
    body: payload,
  });
  return unwrap(response);
};

export const createContactMessageApi = async (payload) => {
  const response = await apiRequest("/contacts", {
    method: "POST",
    body: payload,
  });
  return unwrap(response);
};

export const createOrderApi = async (payload) => {
  const response = await apiRequest("/orders", {
    method: "POST",
    body: payload,
  });
  return unwrap(response);
};

export const getPublicStoreSettingsApi = async () => {
  const response = await apiRequest("/settings/public");
  return unwrap(response);
};

export const getCartApi = async ({ sessionId, customerEmail }) => {
  const response = await apiRequest(`/carts${buildQueryString({ sessionId, customerEmail })}`);
  return unwrap(response);
};

export const saveCartApi = async ({ sessionId, customerEmail, items }) => {
  const response = await apiRequest("/carts", {
    method: "PUT",
    body: { sessionId, customerEmail, items },
  });
  return unwrap(response);
};

export const clearCartApi = async ({ sessionId, customerEmail }) => {
  const response = await apiRequest("/carts", {
    method: "DELETE",
    body: { sessionId, customerEmail },
  });
  return unwrap(response);
};
