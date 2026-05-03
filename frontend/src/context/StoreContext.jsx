import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://api.ridwanbusiness.com";
  const [token, setToken] = useState("");
  const [phone_list, setPhoneList] = useState([]);

  // ✅ Add to cart
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
    if (token) {
      try {
        await axios.post(
          url + "/api/cart/add",
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("Add to cart error:", err.message);
      }
    }
  };

  // ✅ Remove from cart
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId]) return prev;
      if (prev[itemId] <= 1) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return { ...prev, [itemId]: prev[itemId] - 1 };
    });
    if (token) {
      try {
        await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("Remove from cart error:", err.message);
      }
    }
  };

  // ✅ Calculate total
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = phone_list.find((product) => product._id === item);
        if (itemInfo?.price) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // ✅ Fetch products
  const fetchPhoneList = async () => {
    try {
      const response = await axios.get(url + "/api/product/list");
      if (response.data?.success) {
        setPhoneList(response.data.data);
      } else {
        console.error("Unexpected phone list response:", response.data);
      }
    } catch (err) {
      console.error("Fetch phone list error:", err.message);
    }
  };

  // ✅ Load cart
  const loadCartData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token } }
      );
      console.log("Cart response from backend:", response.data); // 🔎 Debug log
      if (response.data?.success && response.data.cartData) {
        setCartItems(response.data.cartData);
      } else {
        console.error("Unexpected cart response:", response.data);
      }
    } catch (err) {
      console.error("Load cart error:", err.message);
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchPhoneList();
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const contextValue = {
    phone_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;