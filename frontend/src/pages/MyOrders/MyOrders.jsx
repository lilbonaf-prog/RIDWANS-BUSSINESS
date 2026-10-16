import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";
import { Link } from "react-router-dom";

import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";

import "./MyOrders.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM CUSTOMER ORDERS DASHBOARD
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
  const value = Number(
    String(amount ?? 0).replace(/,/g, "")
  );

  return currencyFormatter.format(
    Number.isFinite(value) ? value : 0
  );
};

// ==========================================
// FORMAT ORDER DATE
// ==========================================

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ==========================================
// FORMAT ORDER NUMBER
// ==========================================

const formatOrderNumber = (orderId) => {
  if (!orderId) {
    return "Unavailable";
  }

  return `#${String(orderId).slice(-8).toUpperCase()}`;
};

// ==========================================
// COUNT PURCHASED UNITS
// ==========================================

const countItems = (items) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((total, item) => {
    const quantity = Number(item.quantity);

    return total + (
      Number.isFinite(quantity) && quantity > 0
        ? quantity
        : 0
    );
  }, 0);
};

// ==========================================
// ORDER STATUS COLOURS
// ==========================================

const getStatusTone = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value === "paid" ||
    value === "delivered" ||
    value === "completed"
  ) {
    return "success";
  }

  if (
    value.includes("cancel") ||
    value.includes("failed") ||
    value.includes("refunded")
  ) {
    return "danger";
  }

  if (
    value.includes("shipped") ||
    value.includes("transit") ||
    value.includes("dispatched")
  ) {
    return "info";
  }

  return "pending";
};

// ==========================================
// PAYMENT INFORMATION
// ==========================================

const getPaymentInfo = (order) => {
  if (order.payment === true) {
    return {
      label: "Payment Confirmed",
      tone: "success",
    };
  }

  if (order.paymentMethod === "CashOnDelivery") {
    return {
      label: "Pay on Delivery",
      tone: "pending",
    };
  }

  return {
    label: "Payment Pending",
    tone: "pending",
  };
};

// ==========================================
// MY ORDERS COMPONENT
// ==========================================

const MyOrders = () => {
  // ========================================
  // STORE CONTEXT
  // ========================================

  const {
    url,
    token,
    phone_list,
  } = useContext(StoreContext);

  // ========================================
  // COMPONENT STATE
  // ========================================

  const [orderResult, setOrderResult] = useState({
    forToken: "",
    status: "idle",
    orders: [],
  });

  const [refreshing, setRefreshing] = useState(false);

  const [errorResult, setErrorResult] = useState({
    forToken: "",
    message: "",
  });

  // ========================================
  // ONLY SHOW CURRENT CUSTOMER'S ORDERS
  // ========================================

  const isLoaded =
    Boolean(token) &&
    orderResult.forToken === token &&
    orderResult.status === "ready";

  const data = isLoaded
    ? orderResult.orders
    : [];

  const error =
    errorResult.forToken === token
      ? errorResult.message
      : "";

  // ========================================
  // FETCH CUSTOMER ORDERS
  // ========================================

  const fetchOrders = useCallback(
    async (signal) => {
      if (!token || !url) {
        throw new Error(
          "Please sign in to view your orders."
        );
      }

      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
          timeout: 20000,
        }
      );

      if (
        response.data?.success !== true ||
        !Array.isArray(response.data?.data)
      ) {
        throw new Error(
          response.data?.message ||
            "Unable to retrieve your orders."
        );
      }

      return response.data.data;
    },
    [token, url]
  );

  // ========================================
  // LOAD ORDERS
  // ========================================

  useEffect(() => {
    if (!token || !url) {
      return;
    }

    const controller = new AbortController();

    fetchOrders(controller.signal)
      .then((orders) => {
        if (controller.signal.aborted) {
          return;
        }

        setOrderResult({
          forToken: token,
          status: "ready",
          orders,
        });

        setErrorResult({
          forToken: token,
          message: "",
        });
      })
      .catch((err) => {
        if (
          controller.signal.aborted ||
          axios.isCancel(err)
        ) {
          return;
        }

        console.error(
          "Load orders error:",
          err.response?.data || err.message
        );

        setOrderResult({
          forToken: token,
          status: "error",
          orders: [],
        });

        setErrorResult({
          forToken: token,
          message:
            "We couldn't load your orders. Please try refreshing.",
        });
      });

    return () => {
      controller.abort();
    };
  }, [token, url, fetchOrders]);

  // ========================================
  // REFRESH ORDER STATUS
  // ========================================

  const handleRefresh = async () => {
    if (!token || !url || refreshing) {
      return;
    }

    setRefreshing(true);

    setErrorResult({
      forToken: token,
      message: "",
    });

    try {
      const orders = await fetchOrders();

      setOrderResult({
        forToken: token,
        status: "ready",
        orders,
      });
    } catch (err) {
      console.error(
        "Refresh orders error:",
        err.response?.data || err.message
      );

      setErrorResult({
        forToken: token,
        message:
          "Unable to refresh your orders. Please try again.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // ========================================
  // FIND PRODUCT IMAGE
  // ========================================

  const getProductImage = (item) => {
    if (!item?.productId) {
      return assets.parcel_icon;
    }

    const product = (phone_list || []).find(
      (productItem) =>
        String(productItem._id) ===
        String(item.productId)
    );

    return product?.image || assets.parcel_icon;
  };

  // ========================================
  // DASHBOARD STATISTICS
  // ========================================

  const totalOrders = data.length;

  const totalPurchasedItems = data.reduce(
    (total, order) =>
      total + countItems(order.items),
    0
  );

  const paidOrders = data.filter(
    (order) => order.payment === true
  ).length;

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="my-orders">

      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <div className="my-orders__header">

        <div className="my-orders__heading">

          <span className="my-orders__eyebrow">
            RIDWAN BUSINESS
          </span>

          <h1>My Orders</h1>

          <p>
            View your purchases, check payment
            information, and stay updated on
            your order status.
          </p>

        </div>

        {token && (
          <button
            type="button"
            className="my-orders__refresh"
            onClick={handleRefresh}
            disabled={refreshing || !url}
          >
            <span aria-hidden="true">
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh Orders"}
          </button>
        )}

      </div>

      {/* ====================================
          CUSTOMER NOT SIGNED IN
      ==================================== */}

      {!token && (
        <div className="my-orders__empty">

          <div className="my-orders__empty-icon">
            🔒
          </div>

          <h2>Sign In Required</h2>

          <p>
            Please sign in using the account
            button above to view your
            order history.
          </p>

          <Link
            to="/products"
            className="my-orders__shop-button"
          >
            Explore Products
          </Link>

        </div>
      )}

      {/* ====================================
          ERROR MESSAGE
      ==================================== */}

      {error && (
        <div
          className="my-orders__error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* ====================================
          LOADING STATE
      ==================================== */}

      {token && !isLoaded && !error && (
        <div
          className="my-orders__loading"
          role="status"
        >
          Loading your orders...
        </div>
      )}

      {/* ====================================
          ORDER DASHBOARD
      ==================================== */}

      {token && isLoaded && (
        <>

          {/* ================================
              ORDER STATISTICS
          ================================ */}

          <div className="my-orders__stats">

            <div className="my-orders__stat-card">

              <span className="my-orders__stat-label">
                Total Orders
              </span>

              <strong>
                {totalOrders}
              </strong>

              <span className="my-orders__stat-note">
                Orders placed
              </span>

            </div>

            <div className="my-orders__stat-card">

              <span className="my-orders__stat-label">
                Purchased Items
              </span>

              <strong>
                {totalPurchasedItems}
              </strong>

              <span className="my-orders__stat-note">
                Total units ordered
              </span>

            </div>

            <div className="my-orders__stat-card">

              <span className="my-orders__stat-label">
                Paid Orders
              </span>

              <strong>
                {paidOrders}
              </strong>

              <span className="my-orders__stat-note">
                Payment confirmed
              </span>

            </div>

          </div>

          {/* ================================
              ORDER LIST HEADING
          ================================ */}

          <div className="my-orders__section-heading">

            <div>
              <h2>Order History</h2>

              <p>
                Your recent purchases at
                Ridwan Business.
              </p>
            </div>

            <span className="my-orders__count">
              {totalOrders}{" "}
              {totalOrders === 1
                ? "Order"
                : "Orders"}
            </span>

          </div>

          {/* ================================
              EMPTY ORDER HISTORY
          ================================ */}

          {data.length === 0 && (
            <div className="my-orders__empty">

              <div className="my-orders__empty-icon">
                📦
              </div>

              <h3>No Orders Yet</h3>

              <p>
                You haven't placed any orders.
                Explore our collection and
                find something you'll love.
              </p>

              <Link
                to="/products"
                className="my-orders__shop-button"
              >
                Start Shopping
              </Link>

            </div>
          )}

          {/* ================================
              CUSTOMER ORDER CARDS
          ================================ */}

          <div className="my-orders__list">

            {data.map((order, orderIndex) => {
              const items = Array.isArray(order.items)
                ? order.items
                : [];

              const quantity = countItems(items);

              const status =
                order.status || "Pending";

              const paymentInfo =
                getPaymentInfo(order);

              const paymentMethod =
                order.paymentMethod === "CashOnDelivery"
                  ? "Cash on Delivery"
                  : order.paymentMethod === "Online"
                    ? "Paystack"
                    : "Not specified";

              return (
                <article
                  key={order._id || orderIndex}
                  className="my-orders__card"
                >

                  {/* ========================
                      ORDER CARD HEADER
                  ======================== */}

                  <div className="my-orders__card-header">

                    <div className="my-orders__order-info">

                      <span className="my-orders__order-label">
                        ORDER NUMBER
                      </span>

                      <h3
                        title={String(order._id || "")}
                      >
                        {formatOrderNumber(order._id)}
                      </h3>

                      <p>
                        Placed on{" "}
                        {formatDate(
                          order.createdAt || order.date
                        )}
                      </p>

                    </div>

                    <span
                      className={`my-orders__status my-orders__status--${getStatusTone(
                        status
                      )}`}
                    >
                      <span aria-hidden="true">
                        ●
                      </span>

                      {status}
                    </span>

                  </div>

                  {/* ========================
                      ORDERED PRODUCTS
                  ======================== */}

                  <div className="my-orders__products">

                    {items.length === 0 && (
                      <p>
                        Product details are
                        unavailable for this order.
                      </p>
                    )}

                    {items.map((item, index) => (
                      <div
                        className="my-orders__product"
                        key={item._id || index}
                      >

                        <div className="my-orders__image">

                          <img
                            src={getProductImage(item)}
                            alt={item.name || "Product"}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null;

                              event.currentTarget.src =
                                assets.parcel_icon;
                            }}
                          />

                        </div>

                        <div className="my-orders__product-info">

                          <h4>
                            {item.name || "Product"}
                          </h4>

                          <p>
                            Quantity:{" "}
                            <strong>
                              {item.quantity || 1}
                            </strong>
                          </p>

                          <span>
                            Unit price:{" "}
                            {formatCurrency(item.price)}
                          </span>

                        </div>

                        <div className="my-orders__product-total">

                          {formatCurrency(
                            Number(item.price || 0) *
                            Number(item.quantity || 1)
                          )}

                        </div>

                      </div>
                    ))}

                  </div>

                  {/* ========================
                      ORDER PAYMENT DETAILS
                  ======================== */}

                  <div className="my-orders__details">

                    <div className="my-orders__detail">

                      <span>
                        Payment Method
                      </span>

                      <strong>
                        {paymentMethod}
                      </strong>

                    </div>

                    <div className="my-orders__detail">

                      <span>
                        Payment Status
                      </span>

                      <strong
                        className={`my-orders__payment my-orders__payment--${paymentInfo.tone}`}
                      >
                        {paymentInfo.label}
                      </strong>

                    </div>

                    <div className="my-orders__detail">

                      <span>
                        Items Ordered
                      </span>

                      <strong>
                        {quantity}{" "}
                        {quantity === 1
                          ? "Item"
                          : "Items"}
                      </strong>

                    </div>

                  </div>

                  {/* ========================
                      ORDER CARD FOOTER
                  ======================== */}

                  <div className="my-orders__card-footer">

                    <div className="my-orders__total">

                      <span>
                        Order Total
                      </span>

                      <strong>
                        {formatCurrency(order.amount)}
                      </strong>

                    </div>

                    <button
                      type="button"
                      className="my-orders__track-button"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing
                        ? "Refreshing..."
                        : "Refresh Status"}
                    </button>

                  </div>

                </article>
              );
            })}

          </div>

          {/* ================================
              CONTINUE SHOPPING
          ================================ */}

          {data.length > 0 && (
            <div className="my-orders__bottom">

              <p>
                Looking for something else?
                Discover more products at
                Ridwan Business.
              </p>

              <Link
                to="/products"
                className="my-orders__continue"
              >
                Continue Shopping →
              </Link>

            </div>
          )}

        </>
      )}

    </main>
  );
};

export default MyOrders;