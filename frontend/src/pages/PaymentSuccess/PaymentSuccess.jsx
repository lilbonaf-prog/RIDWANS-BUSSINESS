import {
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { StoreContext } from "../../context/StoreContext";

import "./Payment.css";

// ==========================================
// RIDWAN BUSINESS
// SECURE PAYSTACK PAYMENT VERIFICATION
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
// CLEAR CONFIRMED CHECKOUT
// ==========================================

// IMPORTANT:
//
// Only remove the checkout key if:
// 1. The backend confirms payment.
// 2. The verified reference matches.
// 3. The saved reference matches.
// 4. A checkout key exists.
//
// This prevents an older payment from
// clearing a newer pending checkout.

const clearConfirmedCheckout = (
  verifiedReference,
  order
) => {
  try {
    if (
      !verifiedReference ||
      !order ||
      order.payment !== true ||
      order.reference !== verifiedReference
    ) {
      return false;
    }

    const savedReference =
      window.sessionStorage.getItem(
        CHECKOUT_REFERENCE_STORAGE
      );

    const savedCheckoutKey =
      window.sessionStorage.getItem(
        CHECKOUT_KEY_STORAGE
      );

    if (
      !savedCheckoutKey ||
      !savedReference ||
      savedReference !== verifiedReference
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
  } catch (error) {
    console.warn(
      "Checkout storage cleanup:",
      error.message
    );

    return false;
  }
};

// ==========================================
// INITIAL VERIFICATION STATE
// ==========================================

const initialVerification = {
  phase: "checking",
  message: "Verifying your payment with Paystack...",
  order: null,
  cartWarning: false,
};

// ==========================================
// PAYMENT VERIFICATION COMPONENT
// ==========================================

const PaymentVerification = ({
  reference,
  token,
  url,
  setCartItems,
}) => {
  const navigate = useNavigate();

  // ========================================
  // COMPONENT STATE
  // ========================================

  const [verification, setVerification] = useState(
    initialVerification
  );

  const [retryCount, setRetryCount] = useState(0);

  const [countdown, setCountdown] = useState(15);

  // ========================================
  // VERIFY PAYMENT WITH BACKEND
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    const verifyPayment = async () => {
      try {
        // ==================================
        // REQUEST PAYMENT VERIFICATION
        // ==================================

        const response = await axios.get(
          `${url}/api/order/verify`,
          {
            params: {
              reference,
            },

            headers: {
              Authorization: `Bearer ${token}`,
            },

            signal: controller.signal,

            timeout: 20000,
          }
        );

        if (controller.signal.aborted) {
          return;
        }

        const result = response.data;

        // ==================================
        // PAYMENT CONFIRMED
        // ==================================

        if (
          result?.success === true &&
          result?.order?.payment === true &&
          result?.order?.reference === reference
        ) {
          // =================================
          // REMOVE COMPLETED CHECKOUT KEY
          // =================================

          // This runs only after the backend
          // confirms the Paystack payment.

          clearConfirmedCheckout(
            reference,
            result.order
          );

          // =================================
          // UPDATE PAYMENT STATUS
          // =================================

          setVerification({
            phase: "success",

            message:
              "Payment confirmed successfully! Thank you for shopping with Ridwan Business.",

            order: result.order,

            cartWarning:
              result.cartSynchronized === false,
          });

          // =================================
          // REFRESH CUSTOMER SHOPPING CART
          // =================================

          // The backend already processes
          // purchased quantities.
          //
          // We only fetch the latest cart.
          //
          // Do not manually clear it here.

          try {
            const cartResponse = await axios.post(
              `${url}/api/cart/get`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },

                signal: controller.signal,

                timeout: 15000,
              }
            );

            if (controller.signal.aborted) {
              return;
            }

            if (
              cartResponse.data?.success === true &&
              cartResponse.data?.cartData &&
              typeof cartResponse.data.cartData ===
                "object"
            ) {
              setCartItems(cartResponse.data.cartData);
            } else {
              setVerification((previous) => ({
                ...previous,
                cartWarning: true,
              }));
            }
          } catch (cartError) {
            if (
              !controller.signal.aborted &&
              !axios.isCancel(cartError)
            ) {
              console.error(
                "Cart refresh error:",
                cartError.message
              );

              setVerification((previous) => ({
                ...previous,
                cartWarning: true,
              }));
            }
          }

          return;
        }

        // ==================================
        // PAYMENT NOT CONFIRMED
        // ==================================

        const paymentStatus = String(
          result?.paymentStatus || ""
        ).toLowerCase();

        // ==================================
        // FAILED OR ABANDONED PAYMENT
        // ==================================

        if (
          paymentStatus === "failed" ||
          paymentStatus === "abandoned"
        ) {
          setVerification({
            phase: "incomplete",

            message:
              "This payment was not completed. Please review My Orders before attempting another payment.",

            order: null,

            cartWarning: false,
          });

          return;
        }

        // ==================================
        // PENDING PAYMENT
        // ==================================

        // Do not clear checkout keys here.
        // Payment may still be processing.

        setVerification({
          phase: "pending",

          message:
            "Your payment has not been confirmed yet. Please wait a moment and check again.",

          order: null,

          cartWarning: false,
        });

      } catch (error) {
        // ==================================
        // IGNORE CANCELLED REQUESTS
        // ==================================

        if (
          controller.signal.aborted ||
          axios.isCancel(error)
        ) {
          return;
        }

        console.error(
          "Payment verification error:",
          error.response?.data || error.message
        );

        // ==================================
        // AUTHENTICATION ERROR
        // ==================================

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          setVerification({
            phase: "error",

            message:
              "Your session may have expired. Please sign in to the account used for this order, then check the payment again.",

            order: null,

            cartWarning: false,
          });

          return;
        }

        // ==================================
        // ORDER NOT FOUND
        // ==================================

        if (error.response?.status === 404) {
          setVerification({
            phase: "error",

            message:
              "We couldn't find this payment under your account. Please confirm you are signed in to the correct account.",

            order: null,

            cartWarning: false,
          });

          return;
        }

        // ==================================
        // PAYMENT DETAILS MISMATCH
        // ==================================

        if (error.response?.status === 409) {
          setVerification({
            phase: "error",

            message:
              "The payment details do not match this order. Please contact support before making another payment.",

            order: null,

            cartWarning: false,
          });

          return;
        }

        // ==================================
        // NETWORK OR SERVER ERROR
        // ==================================

        setVerification({
          phase: "error",

          message:
            "We couldn't confirm your payment right now. This does not mean your payment failed. Please check again or review My Orders.",

          order: null,

          cartWarning: false,
        });
      }
    };

    verifyPayment();

    // Cancel unfinished verification if
    // customer leaves the page.

    return () => {
      controller.abort();
    };

  }, [
    reference,
    token,
    url,
    retryCount,
    setCartItems,
  ]);

  // ========================================
  // CHECK PAYMENT AGAIN
  // ========================================

  const handleRetry = () => {
    setVerification({
      ...initialVerification,
    });

    setRetryCount((previous) => previous + 1);
  };

  // ========================================
  // REDIRECT AFTER SUCCESS
  // ========================================

  useEffect(() => {
    if (verification.phase !== "success") {
      return;
    }

    const interval = window.setInterval(() => {
      setCountdown((previous) =>
        Math.max(0, previous - 1)
      );
    }, 1000);

    const redirectTimeout = window.setTimeout(() => {
      navigate("/myorders", {
        replace: true,
      });
    }, 15000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(redirectTimeout);
    };

  }, [verification.phase, navigate]);

  // ========================================
  // ORDER INFORMATION
  // ========================================

  const order = verification.order;

  const isSuccessful =
    verification.phase === "success";

  const isChecking =
    verification.phase === "checking";

  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  // ========================================
  // RENDER PAYMENT RESULT
  // ========================================

  return (
    <>
      {/* ====================================
          PAYMENT STATUS MESSAGE
      ==================================== */}

      <p
        role={
          verification.phase === "error"
            ? "alert"
            : "status"
        }
        aria-live="polite"
      >
        {verification.message}
      </p>

      {/* ====================================
          SUCCESSFUL PAYMENT
      ==================================== */}

      {isSuccessful && (
        <div className="order-summary">

          <h3>Payment Confirmed</h3>

          {/* ORDER ID */}

          <p>
            <strong>Order ID:</strong>{" "}
            {order?._id || "Not available"}
          </p>

          {/* PAYSTACK REFERENCE */}

          <p>
            <strong>Payment Reference:</strong>{" "}
            {order?.reference || reference}
          </p>

          {/* ORDER STATUS */}

          <p>
            <strong>Order Status:</strong>{" "}
            {order?.status || "Paid"}
          </p>

          {/* AMOUNT PAID */}

          <p>
            <strong>Amount Paid:</strong>{" "}
            {formatCurrency(order?.amount)}
          </p>

          {/* PAYMENT METHOD */}

          <p>
            <strong>Payment Method:</strong>{" "}
            Paystack
          </p>

          {/* ==================================
              PURCHASED PRODUCTS
          ================================== */}

          {items.length > 0 && (
            <>
              <h4>Purchased Products</h4>

              <ul>
                {items.map((item, index) => (
                  <li key={item._id || index}>
                    {item.name || "Product"}{" "}
                    × {item.quantity || 1}{" "}
                    (
                    {formatCurrency(item.price)}
                    )
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ==================================
              DELIVERY INFORMATION
          ================================== */}

          {order?.address && (
            <>
              <h4>Delivery Information</h4>

              <div className="delivery-info">

                <p>
                  <strong>Name:</strong>{" "}
                  {order.address.recipientName ||
                    "Not provided"}
                </p>

                <p>
                  <strong>Address:</strong>{" "}
                  {[
                    order.address.street,
                    order.address.city,
                    order.address.region,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not provided"}
                </p>

                {order.address.digitalAddress && (
                  <p>
                    <strong>GhanaPost GPS:</strong>{" "}
                    {order.address.digitalAddress}
                  </p>
                )}

                <p>
                  <strong>Phone:</strong>{" "}
                  {order.address.phone ||
                    "Not provided"}
                </p>

              </div>
            </>
          )}

          {/* ==================================
              CART SYNCHRONIZATION WARNING
          ================================== */}

          {verification.cartWarning && (
            <p role="alert">
              Your payment was confirmed,
              but your shopping cart may
              not have updated completely.
              Please review My Orders before
              placing another order.
            </p>
          )}

          {/* ==================================
              REDIRECT COUNTDOWN
          ================================== */}

          <p className="countdown-text">
            Redirecting to My Orders in{" "}
            <strong>{countdown}</strong>{" "}
            seconds...
          </p>

          {/* ==================================
              NAVIGATION BUTTONS
          ================================== */}

          <div className="actions">

            <button
              type="button"
              onClick={() =>
                navigate("/myorders", {
                  replace: true,
                })
              }
              className="btn-orders"
            >
              Go to My Orders
            </button>

            <Link
              to="/"
              className="btn-home"
            >
              Back to Home
            </Link>

          </div>

        </div>
      )}

      {/* ====================================
          PENDING OR INCOMPLETE PAYMENT
      ==================================== */}

      {!isSuccessful && !isChecking && (
        <div className="order-summary">

          <h3>Payment Information</h3>

          <p>
            <strong>Reference:</strong>{" "}
            {reference}
          </p>

          <p>
            You can check this payment again
            without creating another order.
          </p>

          <div className="actions">

            <button
              type="button"
              className="btn-orders"
              onClick={handleRetry}
            >
              Check Payment Again
            </button>

            <Link
              to="/myorders"
              className="btn-home"
            >
              View My Orders
            </Link>

          </div>

        </div>
      )}

      {/* ====================================
          PAYMENT VERIFICATION LOADING
      ==================================== */}

      {isChecking && (
        <p>
          Please wait while we check
          your transaction securely.
        </p>
      )}

    </>
  );
};

// ==========================================
// MAIN PAYMENT SUCCESS PAGE
// ==========================================

const PaymentSuccess = () => {
  const location = useLocation();

  const {
    token,
    url,
    setCartItems,
  } = useContext(StoreContext);

  // ========================================
  // READ PAYSTACK REFERENCE
  // ========================================

  const queryParams = new URLSearchParams(
    location.search
  );

  const reference = (
    queryParams.get("reference") ||
    queryParams.get("trxref") ||
    ""
  ).trim();

  // ========================================
  // RENDER PAGE
  // ========================================

  return (
    <div className="payment-success">

      <h2>Payment Status</h2>

      {/* ====================================
          MISSING PAYMENT REFERENCE
      ==================================== */}

      {!reference ? (
        <p role="alert">
          No payment reference was found.
          Please check My Orders or contact
          support if you have already paid.
        </p>

      ) : !token ? (

        <div className="order-summary">

          <p role="alert">
            Please sign in to the account
            you used for this order to check
            your payment status.
          </p>

          <p>
            Your payment reference is{" "}
            <strong>{reference}</strong>.
          </p>

          <Link
            to="/"
            className="btn-home"
          >
            Return to Home
          </Link>

        </div>

      ) : !url ? (

        <p role="alert">
          Payment verification is temporarily
          unavailable. Please contact support.
        </p>

      ) : (

        <PaymentVerification
          key={reference}
          reference={reference}
          token={token}
          url={url}
          setCartItems={setCartItems}
        />

      )}

    </div>
  );
};

export default PaymentSuccess;