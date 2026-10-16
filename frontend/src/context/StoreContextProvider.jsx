import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { StoreContext } from "./StoreContext";

// ==========================================
// RIDWAN BUSINESS
// STORE CONTEXT PROVIDER
// ==========================================

const StoreContextProvider = ({ children }) => {
  // ========================================
  // BACKEND API URL
  // ========================================

  const url = import.meta.env.VITE_API_URL;

  // ========================================
  // APPLICATION STATE
  // ========================================

  const [cartItems, setCartItems] = useState({});

  const [phone_list, setPhoneList] = useState([]);

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });

  // ========================================
  // CART REQUEST MANAGEMENT
  // ========================================

  // Ensures cart requests are performed
  // sequentially to avoid response-order
  // problems when customers click quickly.

  const cartQueueRef = useRef(Promise.resolve());

  // Tracks the currently active session.
  // Prevents requests from an older session
  // from updating the current cart.

  const currentTokenRef = useRef(token);

  useEffect(() => {
    currentTokenRef.current = token;
  }, [token]);

  const enqueueCartOperation = useCallback((operation) => {
    const queuedOperation = cartQueueRef.current.then(operation);

    // Keep the queue usable even when
    // an operation fails.

    cartQueueRef.current = queuedOperation.catch(() => {});

    return queuedOperation;
  }, []);

  // ========================================
  // AUTHENTICATION HEADERS
  // ========================================

  const getAuthHeaders = (authToken) => ({
    Authorization: `Bearer ${authToken}`,
  });

  // ========================================
  // ADD PRODUCT TO CART
  // ========================================

  const addToCart = async (itemId) => {
    // Guests can still update their local cart.

    if (!token) {
      setCartItems((previousItems) => ({
        ...previousItems,
        [itemId]: (previousItems[itemId] || 0) + 1,
      }));

      return true;
    }

    // Authenticated customers use the
    // backend as the source of truth.

    const requestToken = token;

    return enqueueCartOperation(async () => {
      try {
        const response = await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          {
            headers: getAuthHeaders(requestToken),
          }
        );

        if (
          !response.data?.success ||
          !response.data?.cartData
        ) {
          throw new Error(
            response.data?.message ||
              "Unable to add product to cart."
          );
        }

        if (currentTokenRef.current === requestToken) {
          setCartItems(response.data.cartData);
        }

        return true;
      } catch (error) {
        console.error(
          "Add to cart error:",
          error.response?.data?.message || error.message
        );

        return false;
      }
    });
  };

  // ========================================
  // REMOVE PRODUCT FROM CART
  // ========================================

  const removeFromCart = async (itemId) => {
    // Guest cart handling

    if (!token) {
      setCartItems((previousItems) => {
        const quantity = previousItems[itemId] || 0;

        if (quantity <= 0) {
          return previousItems;
        }

        const updatedItems = {
          ...previousItems,
        };

        if (quantity === 1) {
          delete updatedItems[itemId];
        } else {
          updatedItems[itemId] = quantity - 1;
        }

        return updatedItems;
      });

      return true;
    }

    const requestToken = token;

    return enqueueCartOperation(async () => {
      try {
        const response = await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          {
            headers: getAuthHeaders(requestToken),
          }
        );

        if (
          !response.data?.success ||
          !response.data?.cartData
        ) {
          throw new Error(
            response.data?.message ||
              "Unable to remove product from cart."
          );
        }

        if (currentTokenRef.current === requestToken) {
          setCartItems(response.data.cartData);
        }

        return true;
      } catch (error) {
        console.error(
          "Remove from cart error:",
          error.response?.data?.message || error.message
        );

        return false;
      }
    });
  };

  // ========================================
  // CLEAR SHOPPING CART
  // ========================================

  const clearCart = async () => {
    // IMPORTANT:
    //
    // Authenticated cart clearing is
    // temporarily disabled.
    //
    // The existing checkout calls clearCart()
    // before Paystack confirms payment.
    //
    // We must fix checkout and payment
    // verification before enabling this.

    if (token) {
      console.warn(
        "Authenticated cart clearing is temporarily disabled until checkout payment verification is corrected."
      );

      return false;
    }

    // Guest carts can be cleared locally.

    setCartItems({});
    localStorage.removeItem("cart");

    return true;
  };

  // ========================================
  // CALCULATE CART TOTAL
  // ========================================

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      const quantity = Number(cartItems[itemId]);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        continue;
      }

      const product = phone_list.find(
        (item) => item._id === itemId
      );

      if (product?.price == null) {
        continue;
      }

      const price = Number(
        String(product.price).replace(/,/g, "")
      );

      if (Number.isFinite(price)) {
        totalAmount += price * quantity;
      }
    }

    return totalAmount;
  };

  // ========================================
  // FETCH PRODUCTS FROM BACKEND
  // ========================================

  useEffect(() => {
    let isActive = true;

    const fetchPhoneList = async () => {
      try {
        const response = await axios.get(
          `${url}/api/product/list`
        );

        if (!isActive) {
          return;
        }

        if (
          response.data?.success &&
          Array.isArray(response.data.data)
        ) {
          setPhoneList(response.data.data);
        } else {
          console.error(
            "Unexpected product response:",
            response.data
          );
        }
      } catch (error) {
        if (isActive) {
          console.error(
            "Fetch product error:",
            error.message
          );
        }
      }
    };

    fetchPhoneList();

    const interval = setInterval(fetchPhoneList, 15000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [url]);

  // ========================================
  // LOAD AUTHENTICATED CUSTOMER CART
  // ========================================

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const requestToken = token;

    // Queue the initial cart fetch so it
    // cannot overwrite a newer cart update.

    enqueueCartOperation(async () => {
      try {
        const response = await axios.post(
          `${url}/api/cart/get`,
          {},
          {
            headers: getAuthHeaders(requestToken),
          }
        );

        if (!isActive) {
          return;
        }

        if (currentTokenRef.current !== requestToken) {
          return;
        }

        if (
          response.data?.success &&
          response.data.cartData &&
          typeof response.data.cartData === "object"
        ) {
          setCartItems(response.data.cartData);
        } else {
          console.error(
            "Unexpected cart response:",
            response.data
          );
        }
      } catch (error) {
        if (isActive) {
          console.error(
            "Load cart error:",
            error.response?.data?.message || error.message
          );
        }
      }
    });

    return () => {
      isActive = false;
    };
  }, [token, url, enqueueCartOperation]);

  // ========================================
  // CONTEXT VALUES
  // ========================================

  const contextValue = {
    phone_list,

    cartItems,
    setCartItems,

    addToCart,
    removeFromCart,
    clearCart,

    getTotalCartAmount,

    url,

    token,
    setToken,
  };

  // ========================================
  // CONTEXT PROVIDER
  // ========================================

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;