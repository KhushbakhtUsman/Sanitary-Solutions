import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearCartApi, getCartApi, saveCartApi } from "../services/storeApi";

const CartContext = createContext(null);

const CART_SESSION_KEY = "sanitaryCartSessionId";
const CART_EMAIL_KEY = "sanitaryCartSyncEmail";

const normalizeEmail = (value) => {
  if (!value || typeof value !== "string") return null;
  const cleaned = value.trim().toLowerCase();
  return cleaned || null;
};

const createSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getOrCreateSessionId = () => {
  if (typeof window === "undefined") {
    return createSessionId();
  }

  const existing = localStorage.getItem(CART_SESSION_KEY);
  if (existing) return existing;

  const nextId = createSessionId();
  localStorage.setItem(CART_SESSION_KEY, nextId);
  return nextId;
};

const readStoredSyncEmail = () => {
  if (typeof window === "undefined") return null;
  return normalizeEmail(localStorage.getItem(CART_EMAIL_KEY));
};

const writeStoredSyncEmail = (email) => {
  if (typeof window === "undefined") return;

  if (email) {
    localStorage.setItem(CART_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(CART_EMAIL_KEY);
  }
};

const normalizeProduct = (product) => {
  const productId = product?._id || product?.id;
  if (!productId) return null;

  return {
    ...product,
    id: String(productId),
    _id: String(productId),
    price: Number(product?.price || 0),
    image: product?.image || "",
    name: product?.name || "Product",
    category: product?.category || "",
    brand: product?.brand || "",
    inStock: product?.inStock !== false,
    quantity: Number.isFinite(product?.quantity) ? product.quantity : 0,
  };
};

const mapServerItems = (items = []) =>
  items
    .map((item) => {
      const product = normalizeProduct(item?.product);
      if (!product) return null;
      const quantity = Number.parseInt(item?.quantity, 10);

      return {
        product,
        quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
      };
    })
    .filter(Boolean);

const buildItemsPayload = (items = []) =>
  items
    .map((item) => ({
      productId: item?.product?._id || item?.product?.id,
      quantity: Number.parseInt(item?.quantity, 10),
    }))
    .filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0);

export const CartProvider = ({ children }) => {
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [syncEmail, setSyncEmail] = useState(() => readStoredSyncEmail());
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  const syncItemsToBackend = async (items, emailOverride = syncEmail) => {
    try {
      const response = await saveCartApi({
        sessionId,
        customerEmail: emailOverride || undefined,
        items: buildItemsPayload(items),
      });
      setCart(mapServerItems(response?.items || []));
      setCartError("");
      return true;
    } catch (error) {
      setCartError(error.message || "Unable to save cart.");
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      try {
        setCartLoading(true);
        setCartError("");
        const response = await getCartApi({
          sessionId,
          customerEmail: syncEmail || undefined,
        });
        if (cancelled) return;
        setCart(mapServerItems(response?.items || []));
      } catch (error) {
        if (cancelled) return;
        setCartError(error.message || "Unable to load cart.");
      } finally {
        if (!cancelled) {
          setCartLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const addToCart = async (product, quantityToAdd = 1) => {
    const normalizedProduct = normalizeProduct(product);
    if (!normalizedProduct) return;

    const quantity = Number.parseInt(quantityToAdd, 10);
    if (!Number.isInteger(quantity) || quantity <= 0) return;

    let nextItems = [];
    setCart((previous) => {
      const existing = previous.find((item) => item.product.id === normalizedProduct.id);
      if (existing) {
        nextItems = previous.map((item) =>
          item.product.id === normalizedProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        nextItems = [...previous, { product: normalizedProduct, quantity }];
      }
      return nextItems;
    });

    await syncItemsToBackend(nextItems);
  };

  const updateQuantity = async (productId, quantity) => {
    const normalizedProductId = String(productId || "");
    if (!normalizedProductId) return;

    const nextQuantity = Number.parseInt(quantity, 10);
    if (!Number.isInteger(nextQuantity)) return;

    if (nextQuantity <= 0) {
      await removeFromCart(normalizedProductId);
      return;
    }

    let nextItems = [];
    setCart((previous) => {
      nextItems = previous.map((item) =>
        item.product.id === normalizedProductId ? { ...item, quantity: nextQuantity } : item
      );
      return nextItems;
    });

    await syncItemsToBackend(nextItems);
  };

  const removeFromCart = async (productId) => {
    const normalizedProductId = String(productId || "");
    if (!normalizedProductId) return;

    let nextItems = [];
    setCart((previous) => {
      nextItems = previous.filter((item) => item.product.id !== normalizedProductId);
      return nextItems;
    });

    await syncItemsToBackend(nextItems);
  };

  const clearCart = async () => {
    setCart([]);

    try {
      const response = await clearCartApi({
        sessionId,
        customerEmail: syncEmail || undefined,
      });
      setCart(mapServerItems(response?.items || []));
      setCartError("");
      return true;
    } catch (error) {
      setCartError(error.message || "Unable to clear cart.");
      return false;
    }
  };

  const setCartSyncEmail = async (email, options = {}) => {
    const { mergeWithRemote = true } = options;
    const normalizedEmail = normalizeEmail(email);

    writeStoredSyncEmail(normalizedEmail);
    setSyncEmail(normalizedEmail);

    if (!normalizedEmail) {
      await syncItemsToBackend(cart, null);
      return { success: true, email: null };
    }

    try {
      if (mergeWithRemote) {
        const response = await getCartApi({
          sessionId,
          customerEmail: normalizedEmail,
        });
        setCart(mapServerItems(response?.items || []));
      } else {
        await syncItemsToBackend(cart, normalizedEmail);
      }

      setCartError("");
      return { success: true, email: normalizedEmail };
    } catch (error) {
      const message = error.message || "Unable to sync cart with email.";
      setCartError(message);
      return { success: false, email: normalizedEmail, error: message };
    }
  };

  const getCartTotal = () =>
    cart.reduce((total, item) => total + Number(item.product.price || 0) * item.quantity, 0);

  const getCartItemsCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  const value = useMemo(
    () => ({
      cart,
      cartLoading,
      cartError,
      sessionId,
      syncEmail,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      setCartSyncEmail,
      getCartTotal,
      getCartItemsCount,
    }),
    [cart, cartLoading, cartError, sessionId, syncEmail]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
