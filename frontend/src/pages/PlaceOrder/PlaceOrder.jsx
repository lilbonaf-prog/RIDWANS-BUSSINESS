import { useContext, useRef, useState } from "react";
import axios from "axios";
import { Navigate, useNavigate, Link } from "react-router-dom";

import { StoreContext } from "../../context/StoreContext";

import "./PlaceOrder.css";

// ==========================================
// RIDWAN BUSINESS
// SECURE CHECKOUT & PAYMENT PAGE
// ==========================================

// ==========================================
// GHANA CEDI FORMATTER
// ==========================================

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (amount) => {
  const value = Number(amount);

  return currencyFormatter.format(
    Number.isFinite(value) ? value : 0
  );
};

// ==========================================
// CHECKOUT STORAGE KEYS
// ==========================================

const CHECKOUT_KEY_STORAGE = "ridwan_checkout_key";

const CHECKOUT_REFERENCE_STORAGE =
  "ridwan_checkout_reference";

// ==========================================
// VALIDATE CHECKOUT KEY
// ==========================================

const isValidCheckoutKey = (value) => {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  );
};

// ==========================================
// VALIDATE PAYSTACK REFERENCE
// ==========================================

const isValidPaymentReference = (value) => {
  return (
    typeof value === "string" &&
    /^[A-Za-z0-9._=-]{1,150}$/.test(value)
  );
};

// ==========================================
// GET EXISTING CHECKOUT KEY
// ==========================================

const getSavedCheckoutKey = () => {
  const savedKey = window.sessionStorage.getItem(
    CHECKOUT_KEY_STORAGE
  );

  return isValidCheckoutKey(savedKey)
    ? savedKey
    : null;
};

// ==========================================
// GENERATE OR REUSE CHECKOUT KEY
// ==========================================

const getOrCreateCheckoutKey = () => {
  const savedKey = getSavedCheckoutKey();

  // Reuse the key when retrying an
  // unfinished checkout attempt.

  if (savedKey) {
    return savedKey;
  }

  if (
    !window.crypto ||
    typeof window.crypto.randomUUID !== "function"
  ) {
    throw new Error(
      "Secure checkout is unavailable in this browser. Please update your browser."
    );
  }

  const newKey = window.crypto.randomUUID();

  window.sessionStorage.setItem(
    CHECKOUT_KEY_STORAGE,
    newKey
  );

  // A new checkout must not inherit
  // another transaction's reference.

  window.sessionStorage.removeItem(
    CHECKOUT_REFERENCE_STORAGE
  );

  return newKey;
};

// ==========================================
// SAVE PAYMENT REFERENCE
// ==========================================

const savePaymentReference = (reference) => {
  if (!isValidPaymentReference(reference)) {
    throw new Error(
      "The payment reference returned by the server is invalid."
    );
  }

  window.sessionStorage.setItem(
    CHECKOUT_REFERENCE_STORAGE,
    reference
  );
};

// ==========================================
// CLEAR A COMPLETED CHECKOUT
// ==========================================

const clearCompletedCheckout = (checkoutKey) => {
  // Do not delete a different checkout
  // that may have started in this tab.

  if (
    window.sessionStorage.getItem(
      CHECKOUT_KEY_STORAGE
    ) !== checkoutKey
  ) {
    return false;
  }

  window.sessionStorage.removeItem(
    CHECKOUT_KEY_STORAGE
  );

  window.sessionStorage.removeItem(
    CHECKOUT_REFERENCE_STORAGE
  );

  return true;
};

// ==========================================
// PLACE ORDER COMPONENT
// ==========================================

const PlaceOrder = () => {
  // ========================================
  // STORE CONTEXT
  // ========================================

  const {
    getTotalCartAmount,
    cartItems,
    setCartItems,
    url,
    token,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  // ========================================
  // CUSTOMER DELIVERY INFORMATION
  // ========================================

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    region: "",
    digitalAddress: "",
    country: "Ghana",
    phone: "",
    paymentMethod: "Online",
  });

  // ========================================
  // CHECKOUT STATE
  // ========================================

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // Prevent duplicate submissions
  // before React updates the button.

  const submittingRef = useRef(false);

  // ========================================
  // CALCULATE ORDER TOTAL
  // ========================================

  const subtotal = Number(getTotalCartAmount()) || 0;

  // The backend uses actual product prices
  // from MongoDB to calculate payment totals.

  const total = subtotal;

  // ========================================
  // CHECK CART CONTENTS
  // ========================================

  const hasCartItems = Object.values(
    cartItems || {}
  ).some((quantity) => Number(quantity) > 0);

  // ========================================
  // HANDLE FORM CHANGES
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ========================================
  // CHECK PREVIOUS CHECKOUT STATUS
  // ========================================

  const checkPreviousCheckout = async (checkoutKey) => {
    const response = await axios.post(
      `${url}/api/order/userorders`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      }
    );

    if (
      response.data?.success !== true ||
      !Array.isArray(response.data?.data)
    ) {
      throw new Error(
        "Unable to check your previous checkout. Please try again."
      );
    }

    // Find an order belonging to the
    // current customer and checkout key.

    return (
      response.data.data.find(
        (order) => order.checkoutKey === checkoutKey
      ) || null
    );
  };

  // ========================================
  // PLACE ORDER / INITIALIZE PAYMENT
  // ========================================

  const handlePayment = async (event) => {
    event.preventDefault();

    // ======================================
    // PREVENT DOUBLE SUBMISSIONS
    // ======================================

    if (submittingRef.current) {
      return;
    }

    setErrorMessage("");

    // ======================================
    // CHECK AUTHENTICATION
    // ======================================

    if (!token) {
      setErrorMessage(
        "Please sign in before proceeding to checkout."
      );

      return;
    }

    // ======================================
    // CHECK BACKEND URL
    // ======================================

    if (!url) {
      setErrorMessage(
        "Checkout is temporarily unavailable. Please try again later."
      );

      return;
    }

    // ======================================
    // PREPARE ORDER ITEMS
    // ======================================

    const items = Object.entries(cartItems || {})
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity: Number(quantity),
      }));

    // ======================================
    // VALIDATE ORDER ITEMS
    // ======================================

    if (
      !items.length ||
      items.some(
        (item) =>
          !Number.isInteger(item.quantity) ||
          item.quantity < 1
      )
    ) {
      setErrorMessage(
        "Your shopping cart contains invalid items. Please review your cart."
      );

      return;
    }

    // ======================================
    // PREPARE DELIVERY ADDRESS
    // ======================================

    const address = {
      recipientName: [
        formData.firstName.trim(),
        formData.lastName.trim(),
      ]
        .filter(Boolean)
        .join(" "),

      street: formData.street.trim(),

      city: formData.city.trim(),

      region: formData.region.trim(),

      digitalAddress: formData.digitalAddress.trim(),

      country: formData.country,

      phone: formData.phone.trim(),

      email: formData.email.trim(),
    };

    // ======================================
    // VALIDATE DELIVERY INFORMATION
    // ======================================

    if (
      !address.recipientName ||
      !address.street ||
      !address.city ||
      !address.region ||
      !address.phone ||
      !address.email
    ) {
      setErrorMessage(
        "Please complete your delivery information."
      );

      return;
    }

    // ======================================
    // LOCK CHECKOUT
    // ======================================

    submittingRef.current = true;
    setIsSubmitting(true);

    let navigationStarted = false;

    try {
      // ====================================
      // CHECK EXISTING CHECKOUT KEY
      // ====================================

      const savedCheckoutKey = getSavedCheckoutKey();

      // Before reusing an existing key,
      // confirm whether its order was
      // completed in an earlier request.

      if (savedCheckoutKey) {
        const previousOrder = await checkPreviousCheckout(
          savedCheckoutKey
        );

        if (previousOrder) {
          // =================================
          // COMPLETED PAYSTACK PAYMENT
          // =================================

          if (
            previousOrder.paymentMethod === "Online" &&
            previousOrder.payment === true
          ) {
            clearCompletedCheckout(savedCheckoutKey);

            setErrorMessage(
              "Your previous Paystack payment has already been confirmed. We've reset the completed checkout. Please review My Orders and refresh your cart before starting a new purchase."
            );

            return;
          }

          // =================================
          // COMPLETED CASH ON DELIVERY ORDER
          // =================================

          if (
            previousOrder.paymentMethod === "CashOnDelivery"
          ) {
            clearCompletedCheckout(savedCheckoutKey);

            setErrorMessage(
              "Your previous Cash on Delivery order has already been placed. Please check My Orders and review your cart before submitting another purchase."
            );

            return;
          }

          // =================================
          // PENDING ONLINE CHECKOUT
          // =================================

          // Keep the existing key.
          //
          // The backend will ensure this
          // retry matches the original
          // products and delivery details.
          //
          // It will return the saved payment
          // link when one is available.
        }
      }

      // ====================================
      // GET OR CREATE CHECKOUT KEY
      // ====================================

      const checkoutKey = getOrCreateCheckoutKey();

      // ====================================
      // SEND ORDER TO BACKEND
      // ====================================

      const response = await axios.post(
        `${url}/api/order/place`,
        {
          email: formData.email.trim(),
          items,
          address,
          paymentMethod: formData.paymentMethod,
          checkoutKey,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      // ====================================
      // CHECK SERVER RESPONSE
      // ====================================

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to place your order."
        );
      }

      // ====================================
      // CASH ON DELIVERY
      // ====================================

      if (formData.paymentMethod === "CashOnDelivery") {
        // Backend has created the order
        // and updated the saved cart.

        let cartRefreshed = false;

        try {
          const cartResponse = await axios.post(
            `${url}/api/cart/get`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              timeout: 15000,
            }
          );

          if (
            cartResponse.data?.success &&
            cartResponse.data?.cartData &&
            typeof cartResponse.data.cartData === "object"
          ) {
            setCartItems(cartResponse.data.cartData);

            cartRefreshed = true;
          }
        } catch (cartError) {
          console.error(
            "Cart refresh after Cash on Delivery:",
            cartError.message
          );
        }

        // Remove this checkout key only
        // after the server confirms the
        // Cash on Delivery order.

        clearCompletedCheckout(checkoutKey);

        navigationStarted = true;

        if (
          response.data.cartSynchronized === false ||
          !cartRefreshed
        ) {
          alert(
            "Your Cash on Delivery order was placed successfully, but your cart may not have refreshed completely. Please review My Orders before placing another order."
          );
        } else {
          alert(
            "Order placed successfully! You will pay when your order is delivered."
          );
        }

        navigate("/myorders", {
          replace: true,
        });

        return;
      }

      // ====================================
      // PAYSTACK ONLINE PAYMENT
      // ====================================

      if (formData.paymentMethod === "Online") {
        const authorizationUrl =
          response.data.authorization_url;

        const paymentReference =
          response.data.reference;

        // ==================================
        // VALIDATE PAYMENT REFERENCE
        // ==================================

        if (!isValidPaymentReference(paymentReference)) {
          throw new Error(
            "Your order was created, but the payment reference is unavailable. Please check My Orders before trying again."
          );
        }

        // ==================================
        // VALIDATE PAYMENT LINK
        // ==================================

        if (
          typeof authorizationUrl !== "string" ||
          !authorizationUrl
        ) {
          throw new Error(
            "Your order was created, but the payment link is unavailable. Please check My Orders before trying again."
          );
        }

        const paymentUrl = new URL(authorizationUrl);

        const isPaystackUrl =
          paymentUrl.protocol === "https:" &&
          (
            paymentUrl.hostname === "paystack.com" ||
            paymentUrl.hostname.endsWith(".paystack.com")
          );

        if (!isPaystackUrl) {
          throw new Error(
            "A valid Paystack payment link was not returned. Please contact support."
          );
        }

        // ==================================
        // SAVE TRANSACTION REFERENCE
        // ==================================

        // PaymentSuccess.jsx will later
        // compare this reference with the
        // backend-confirmed payment.
        //
        // Only the matching completed
        // checkout key will be removed.

        savePaymentReference(paymentReference);

        // ==================================
        // KEEP CHECKOUT KEY
        // ==================================

        // Payment has not yet been confirmed.
        //
        // Do not remove the checkout key,
        // and do not clear the shopping cart.

        // ==================================
        // REDIRECT TO PAYSTACK
        // ==================================

        navigationStarted = true;

        window.location.assign(
          paymentUrl.toString()
        );

        return;
      }

      throw new Error(
        "The selected payment method is unavailable."
      );

    } catch (error) {
      console.error(
        "Checkout error:",
        error.response?.data || error.message
      );

      const serverMessage =
        error.response?.data?.message;

      // ====================================
      // EXISTING CHECKOUT / CART CONFLICT
      // ====================================

      if (error.response?.status === 409) {
        setErrorMessage(
          serverMessage ||
            "This checkout could not be completed. Please review My Orders before retrying."
        );
      }

      // ====================================
      // SERVER ERROR
      // ====================================

      else if (serverMessage) {
        setErrorMessage(serverMessage);
      }

      // ====================================
      // NETWORK ERROR
      // ====================================

      else if (
        error.isAxiosError &&
        !error.response
      ) {
        setErrorMessage(
          "We could not confirm whether your order was received. Please check My Orders before trying again."
        );
      }

      // ====================================
      // OTHER ERRORS
      // ====================================

      else {
        setErrorMessage(
          error.message ||
            "Unable to process checkout. Please try again."
        );
      }

      // IMPORTANT:
      //
      // Do not automatically clear the
      // checkout key after an error.
      //
      // A previous request may already
      // have created an order.

    } finally {
      // ====================================
      // UNLOCK CHECKOUT
      // ====================================

      if (!navigationStarted) {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  // ========================================
  // REQUIRE CUSTOMER LOGIN
  // ========================================

  if (!token) {
    return <Navigate to="/cart" replace />;
  }

  // ========================================
  // CHECKOUT FORM
  // ========================================

  return (
    <form
      className="place-order"
      onSubmit={handlePayment}
    >
      {/* ====================================
          DELIVERY INFORMATION
      ==================================== */}

      <div className="place-order-left">
        <p className="title">
          Delivery Information
        </p>

        {/* CUSTOMER NAME */}

        <div className="multy-fields">
          <input
            required
            type="text"
            name="firstName"
            aria-label="First name"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            autoComplete="given-name"
          />

          <input
            required
            type="text"
            name="lastName"
            aria-label="Last name"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            autoComplete="family-name"
          />
        </div>

        {/* EMAIL ADDRESS */}

        <input
          required
          type="email"
          name="email"
          aria-label="Email address"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
        />

        {/* STREET ADDRESS */}

        <input
          required
          type="text"
          name="street"
          aria-label="Street address"
          placeholder="Street / Area / Landmark"
          value={formData.street}
          onChange={handleChange}
          autoComplete="street-address"
        />

        {/* CITY AND REGION */}

        <div className="multy-fields">
          <input
            required
            type="text"
            name="city"
            aria-label="City or town"
            placeholder="City / Town"
            value={formData.city}
            onChange={handleChange}
            autoComplete="address-level2"
          />

          <input
            required
            type="text"
            name="region"
            aria-label="Region"
            placeholder="Region"
            value={formData.region}
            onChange={handleChange}
            autoComplete="address-level1"
          />
        </div>

        {/* GHANAPOST GPS ADDRESS */}

        <input
          required
          type="text"
          name="digitalAddress"
          aria-label="GhanaPost GPS digital address"
          placeholder="Digital Address (GhanaPost GPS)"
          value={formData.digitalAddress}
          onChange={handleChange}
        />

        {/* COUNTRY */}

        <input
          required
          type="text"
          name="country"
          aria-label="Country"
          value={formData.country}
          readOnly
        />

        {/* PHONE NUMBER */}

        <input
          required
          type="tel"
          name="phone"
          aria-label="Phone number"
          placeholder="Phone number"
          value={formData.phone}
          onChange={handleChange}
          autoComplete="tel"
        />
      </div>

      {/* ====================================
          ORDER SUMMARY
      ==================================== */}

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Order Summary</h2>

          {/* SUBTOTAL */}

          <div className="cart-total-details">
            <p>Subtotal</p>

            <p>{formatCurrency(subtotal)}</p>
          </div>

          <hr />

          {/* TOTAL */}

          <div className="cart-total-details">
            <b>Total</b>

            <b>{formatCurrency(total)}</b>
          </div>

          <hr />

          {/* PAYMENT METHOD */}

          <div className="cart-total-details">
            <p>Payment Method</p>
          </div>

          <div className="payment-method-card">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="Online"
                checked={
                  formData.paymentMethod === "Online"
                }
                onChange={handleChange}
              />

              Pay Online (Paystack)
            </label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="CashOnDelivery"
                checked={
                  formData.paymentMethod === "CashOnDelivery"
                }
                onChange={handleChange}
              />

              Payment on Delivery
            </label>
          </div>

          {/* EMPTY CART */}

          {!hasCartItems && !isSubmitting && (
            <p role="alert">
              Your cart is empty.{" "}

              <Link to="/cart">
                Return to your cart
              </Link>
            </p>
          )}

          {/* CHECKOUT ERROR */}

          {errorMessage && (
            <p role="alert">
              {errorMessage}
            </p>
          )}

          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            disabled={
              isSubmitting || !hasCartItems
            }
          >
            {isSubmitting
              ? "PROCESSING..."
              : formData.paymentMethod === "CashOnDelivery"
                ? "PLACE ORDER"
                : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;