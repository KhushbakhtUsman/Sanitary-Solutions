import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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

  const cartRef = useRef([]);
  const syncEmailRef = useRef(syncEmail);
  const mutationQueueRef = useRef(Promise.resolve());

  const setCartState = (items) => {
    cartRef.current = items;
    setCart(items);
  };

  const enqueueCartTask = (task) => {
    const run = mutationQueueRef.current.then(task);
    mutationQueueRef.current = run.catch(() => {});
    return run;
  };

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  useEffect(() => {
    syncEmailRef.current = syncEmail;
  }, [syncEmail]);

  const syncItemsToBackend = async (items, emailOverride = syncEmailRef.current) => {
    try {
      const response = await saveCartApi({
        sessionId,
        customerEmail: emailOverride || undefined,
        items: buildItemsPayload(items),
      });
      setCartState(mapServerItems(response?.items || []));
      setCartError("");
      return true;
    } catch (error) {
      setCartError(error.message || "Unable to save cart.");
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;

    enqueueCartTask(async () => {
      try {
        setCartLoading(true);
        setCartError("");
        const response = await getCartApi({
          sessionId,
          customerEmail: syncEmailRef.current || undefined,
        });
        if (cancelled) return;
        setCartState(mapServerItems(response?.items || []));
      } catch (error) {
        if (cancelled) return;
        setCartError(error.message || "Unable to load cart.");
      } finally {
        if (!cancelled) {
          setCartLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const addToCart = async (product, quantityToAdd = 1) => {
    const normalizedProduct = normalizeProduct(product);
    if (!normalizedProduct) return;

    const quantity = Number.parseInt(quantityToAdd, 10);
    if (!Number.isInteger(quantity) || quantity <= 0) return;

    await enqueueCartTask(async () => {
      const previous = cartRef.current;
      const existing = previous.find((item) => item.product.id === normalizedProduct.id);

      const nextItems = existing
        ? previous.map((item) =>
            item.product.id === normalizedProduct.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...previous, { product: normalizedProduct, quantity }];

      setCartState(nextItems);
      await syncItemsToBackend(nextItems);
    });
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

    await enqueueCartTask(async () => {
      const previous = cartRef.current;
      const nextItems = previous.map((item) =>
        item.product.id === normalizedProductId ? { ...item, quantity: nextQuantity } : item
      );

      setCartState(nextItems);
      await syncItemsToBackend(nextItems);
    });
  };

  const removeFromCart = async (productId) => {
    const normalizedProductId = String(productId || "");
    if (!normalizedProductId) return;

    await enqueueCartTask(async () => {
      const previous = cartRef.current;
      const nextItems = previous.filter((item) => item.product.id !== normalizedProductId);

      setCartState(nextItems);
      await syncItemsToBackend(nextItems);
    });
  };

  const clearCart = async () =>
    enqueueCartTask(async () => {
      const previous = cartRef.current;
      setCartState([]);

      try {
        const response = await clearCartApi({
          sessionId,
          customerEmail: syncEmailRef.current || undefined,
        });
        setCartState(mapServerItems(response?.items || []));
        setCartError("");
        return true;
      } catch (error) {
        setCartState(previous);
        setCartError(error.message || "Unable to clear cart.");
        return false;
      }
    });

  const setCartSyncEmail = async (email, options = {}) =>
    enqueueCartTask(async () => {
      const { mergeWithRemote = true } = options;
      const normalizedEmail = normalizeEmail(email);

      writeStoredSyncEmail(normalizedEmail);
      setSyncEmail(normalizedEmail);
      syncEmailRef.current = normalizedEmail;

      if (!normalizedEmail) {
        await syncItemsToBackend(cartRef.current, null);
        return { success: true, email: null };
      }

      try {
        if (mergeWithRemote) {
          const response = await getCartApi({
            sessionId,
            customerEmail: normalizedEmail,
          });
          setCartState(mapServerItems(response?.items || []));
        } else {
          await syncItemsToBackend(cartRef.current, normalizedEmail);
        }

        setCartError("");
        return { success: true, email: normalizedEmail };
      } catch (error) {
        const message = error.message || "Unable to sync cart with email.";
        setCartError(message);
        return { success: false, email: normalizedEmail, error: message };
      }
    });

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
