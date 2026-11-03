import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import { toast } from "react-toastify";

import "./Orders.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM ORDER MANAGEMENT PAGE
// ==========================================

// These are the delivery stages supported
// by our existing order-status API.
//
// "Paid" is an existing order status returned
// by the backend. We display and count it,
// but do not offer it as a new status action.

const DELIVERY_STATUSES = [
  "Product Processing",
  "Out for delivery",
  "Delivered",
];

// ==========================================
// ICON COMPONENT
// ==========================================

const Icon = ({ name, size = 20 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "box":
      return (
        <svg {...props}>
          <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" />
          <path d="m3 7 9 4 9-4" />
          <path d="M12 11v10" />
        </svg>
      );

    case "truck":
      return (
        <svg {...props}>
          <path d="M3 5h12v12H3z" />
          <path d="M15 9h4l3 4v4h-7z" />
          <circle cx="7.5" cy="18" r="2" />
          <circle cx="18.5" cy="18" r="2" />
        </svg>
      );

    case "check":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      );

    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...props}>
          <path d="M20 7v5h-5" />
          <path d="M4 17v-5h5" />
          <path d="M5.5 9a7 7 0 0 1 12-3l2.5 6" />
          <path d="M18.5 15a7 7 0 0 1-12 3L4 12" />
        </svg>
      );

    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </svg>
      );

    case "location":
      return (
        <svg {...props}>
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "phone":
      return (
        <svg {...props}>
          <path d="M7 3H4a2 2 0 0 0-2 2c0 9.4 7.6 17 17 17a2 2 0 0 0 2-2v-3l-5-2-2 3a16 16 0 0 1-8-8l3-2-2-5Z" />
        </svg>
      );

    case "card":
      return (
        <svg {...props}>
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <path d="M2 10h20" />
        </svg>
      );

    case "delete":
      return (
        <svg {...props}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M6 6l1 15h10l1-15" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// GHANA CEDI PRICE FORMATTER
// ==========================================

const formatPrice = (amount) => {
  const value = Number(amount);

  return `GH₵${(
    Number.isFinite(value) ? value : 0
  ).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ==========================================
// DATE FORMATTER
// ==========================================

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

// ==========================================
// PAYMENT METHOD FORMATTER
// ==========================================

const formatPaymentMethod = (method) => {
  if (method === "CashOnDelivery") {
    return "Cash on Delivery";
  }

  if (method === "Online") {
    return "Online (Paystack)";
  }

  return method || "Not specified";
};

// ==========================================
// ORDER STATUS COLORS
// ==========================================

const getStatusClass = (status) => {
  if (status === "Delivered") {
    return "delivered";
  }

  if (status === "Out for delivery") {
    return "delivery";
  }

  if (status === "Product Processing") {
    return "processing";
  }

  if (status === "Paid") {
    return "paid";
  }

  return "other";
};

// ==========================================
// ORDER DELETION ELIGIBILITY
// ==========================================

// Match the backend's protection for paid and online orders.
// The dashboard additionally requires delivery to be complete.
// This is a UI safeguard; the backend remains authoritative.
const canDeleteOrder = (order) =>
  order.status === "Delivered" &&
  order.paymentMethod === "CashOnDelivery" &&
  order.payment !== true;

// ==========================================
// MAIN ORDERS COMPONENT
// ==========================================

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [paymentFilter, setPaymentFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const requestInProgress = useRef(false);

  // Backend API URL

  const API_URL = (url || "").replace(/\/+$/, "");

  // ========================================
  // FETCH ALL ORDERS
  // ========================================

  const fetchAllOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (requestInProgress.current) return;

      if (!API_URL) {
        setError(
          "Backend API URL is not configured."
        );

        setLoading(false);
        return;
      }

      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        setError(
          "Admin session not found. Please sign in again."
        );

        setLoading(false);
        return;
      }

      requestInProgress.current = true;

      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/order/list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 90000,
          }
        );

        if (
          !response.data?.success ||
          !Array.isArray(response.data.data)
        ) {
          throw new Error(
            response.data?.message ||
              "Unable to load orders."
          );
        }

        setOrders(response.data.data);

        setError("");
      } catch (err) {
        console.error(
          "Order fetch failed:",
          err.message
        );

        setError(
          err.response?.status === 401
            ? "Your admin session has expired. Please sign in again."
            : err.response?.data?.message ||
                "Unable to retrieve orders. Please try again."
        );
      } finally {
        requestInProgress.current = false;

        setLoading(false);
      }
    },
    [API_URL]
  );

  // ========================================
  // INITIAL LOAD AND AUTO REFRESH
  // ========================================

  useEffect(() => {
    fetchAllOrders();

    // Refresh quietly every 20 seconds
    // when the browser page is visible.

    const interval = window.setInterval(() => {
      if (
        document.visibilityState === "visible"
      ) {
        fetchAllOrders({
          silent: true,
        });
      }
    }, 20000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchAllOrders]);

  // ========================================
  // ORDER STATISTICS
  // ========================================

  const statistics = useMemo(
    () => ({
      total: orders.length,

      paid: orders.filter(
        (order) => order.status === "Paid"
      ).length,

      processing: orders.filter(
        (order) =>
          order.status === "Product Processing"
      ).length,

      delivery: orders.filter(
        (order) =>
          order.status === "Out for delivery"
      ).length,

      delivered: orders.filter(
        (order) =>
          order.status === "Delivered"
      ).length,
    }),
    [orders]
  );

  // ========================================
  // AVAILABLE STATUS FILTERS
  // ========================================

  // Include Paid and other statuses returned
  // by the backend in the filter.
  //
  // This does not make those statuses
  // available as update actions.

  const availableStatusFilters = useMemo(
    () =>
      Array.from(
        new Set([
          "Paid",
          ...DELIVERY_STATUSES,
          ...orders
            .map((order) => order.status)
            .filter(Boolean),
        ])
      ),
    [orders]
  );

  // ========================================
  // SEARCH AND FILTER ORDERS
  // ========================================

  const filteredOrders = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const address = order.address || {};

      const items = Array.isArray(order.items)
        ? order.items
        : [];

      const searchableText = [
        order._id,
        address.recipientName,
        address.phone,
        address.city,
        address.region,
        ...items.map((item) => item.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const matchesPayment =
        paymentFilter === "All" ||
        order.paymentMethod === paymentFilter;

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesPayment &&
        matchesStatus
      );
    });
  }, [
    orders,
    searchTerm,
    paymentFilter,
    statusFilter,
  ]);

  // ========================================
  // UPDATE ORDER STATUS
  // ========================================

  const statusHandler = async (
    orderId,
    newStatus
  ) => {
    if (updatingId || deletingId) return;

    if (
      !DELIVERY_STATUSES.includes(newStatus)
    ) {
      toast.error(
        "Invalid order status selection."
      );

      return;
    }

    const token =
      localStorage.getItem("adminToken");

    if (!token) {
      toast.error("Please sign in again.");
      return;
    }

    try {
      setUpdatingId(orderId);

      const response = await axios.post(
        `${API_URL}/api/order/status`,
        {
          orderId,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 90000,
        }
      );

      if (response.data?.success) {
        toast.success(
          "Order status updated!"
        );

        setOrders((previous) =>
          previous.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status: newStatus,
                }
              : order
          )
        );
      } else {
        toast.error(
          response.data?.message ||
            "Failed to update order status."
        );
      }
    } catch (err) {
      console.error(
        "Status update failed:",
        err.message
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ========================================
  // DELETE DELIVERED ORDER
  // ========================================

  const deleteOrder = async (order) => {
    if (deletingId || updatingId) return;

    // Only unpaid, delivered Cash on Delivery orders
    // may be deleted from this dashboard.

    if (!canDeleteOrder(order)) {
      toast.error(
        "Only unpaid, delivered Cash on Delivery orders can be deleted."
      );

      return;
    }

    const customerName =
      order.address?.recipientName ||
      "this customer";

    const confirmed = window.confirm(
      `Permanently delete the delivered order for ${customerName}?\n\nThis action cannot be undone and may remove important order records.`
    );

    if (!confirmed) return;

    const token =
      localStorage.getItem("adminToken");

    if (!token) {
      toast.error("Please sign in again.");
      return;
    }

    try {
      setDeletingId(order._id);

      const response = await axios.delete(
        `${API_URL}/api/order/delete/${encodeURIComponent(
          order._id
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 90000,
        }
      );

      if (response.data?.success) {
        toast.success(
          "Order deleted successfully."
        );

        setOrders((previous) =>
          previous.filter(
            (item) =>
              item._id !== order._id
          )
        );
      } else {
        toast.error(
          response.data?.message ||
            "Unable to delete order."
        );
      }
    } catch (err) {
      console.error(
        "Order deletion failed:",
        err.message
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to delete order."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // CLEAR SEARCH FILTERS
  // ========================================

  const clearFilters = () => {
    setSearchTerm("");
    setPaymentFilter("All");
    setStatusFilter("All");
  };

  // ========================================
  // STATISTICS CARD CONFIGURATION
  // ========================================

  const statCards = [
    {
      title: "Total Orders",
      count: statistics.total,
      description: "Customer orders received",
      icon: "box",
      color: "red",
    },
    {
      title: "Paid Status",
      count: statistics.paid,
      description: "Orders currently marked Paid",
      icon: "card",
      color: "gold",
    },
    {
      title: "Processing",
      count: statistics.processing,
      description: "Orders being prepared",
      icon: "clock",
      color: "gold",
    },
    {
      title: "Out for Delivery",
      count: statistics.delivery,
      description: "Orders on their way",
      icon: "truck",
      color: "blue",
    },
    {
      title: "Delivered",
      count: statistics.delivered,
      description: "Completed deliveries",
      icon: "check",
      color: "green",
    },
  ];

  // ========================================
  // MAIN PAGE
  // ========================================

  return (
    <div className="orders-page">

      {/* PAGE HEADER */}

      <div className="orders-page-header">
        <div className="orders-page-heading">
          <span className="orders-eyebrow">
            SALES &amp; ORDER MANAGEMENT
          </span>

          <h1>Manage Orders</h1>

          <p>
            Monitor purchases, review customer
            details, and manage product deliveries.
          </p>
        </div>

        <button
          type="button"
          className="orders-refresh-btn"
          onClick={() => fetchAllOrders()}
          disabled={loading}
        >
          <Icon name="refresh" size={18} />

          <span>
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      </div>

      {/* ====================================
          ORDER STATISTICS
      ==================================== */}

      <div className="orders-stats-grid">
        {statCards.map((card) => (
          <div
            className="orders-stat-card"
            key={card.title}
          >
            <div
              className={`orders-stat-icon ${card.color}`}
            >
              <Icon
                name={card.icon}
                size={25}
              />
            </div>

            <div className="orders-stat-details">
              <span>{card.title}</span>

              <strong>{card.count}</strong>

              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ====================================
          MAIN ORDERS CARD
      ==================================== */}

      <section className="orders-management-card">

        {/* MANAGEMENT HEADER */}

        <div className="orders-management-header">
          <div>
            <span className="orders-section-label">
              CUSTOMER PURCHASES
            </span>

            <h2>All Customer Orders</h2>

            <p>
              Review orders and update their
              progress.
            </p>
          </div>

          <span className="orders-count-badge">
            {orders.length} Orders
          </span>
        </div>

        {/* ==================================
            SEARCH AND FILTERS
        ================================== */}

        <div className="orders-toolbar">

          {/* SEARCH */}

          <div className="orders-search-wrapper">
            <Icon
              name="search"
              size={19}
            />

            <input
              type="search"
              placeholder="Search customer, phone or product..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search orders"
            />
          </div>

          {/* PAYMENT FILTER */}

          <div className="orders-filter-group">
            <label htmlFor="orders-payment-filter">
              Payment
            </label>

            <select
              id="orders-payment-filter"
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(event.target.value)
              }
            >
              <option value="All">
                All Payments
              </option>

              <option value="CashOnDelivery">
                Cash on Delivery
              </option>

              <option value="Online">
                Online (Paystack)
              </option>
            </select>
          </div>

          {/* ORDER STATUS FILTER */}

          <div className="orders-filter-group">
            <label htmlFor="orders-status-filter">
              Status
            </label>

            <select
              id="orders-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">
                All Statuses
              </option>

              {availableStatusFilters.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* ==================================
            LOADING STATE
        ================================== */}

        {loading && orders.length === 0 ? (
          <div
            className="orders-state"
            role="status"
          >
            <div className="orders-loading-spinner" />

            <h3>Loading Orders</h3>

            <p>
              Retrieving customer orders...
            </p>
          </div>
        ) : error && orders.length === 0 ? (

          /* ERROR STATE */

          <div className="orders-state orders-error-state">
            <Icon
              name="box"
              size={40}
            />

            <h3>Unable to Load Orders</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => fetchAllOrders()}
            >
              Try Again
            </button>
          </div>

        ) : (
          <>

            {/* REFRESH ERROR */}

            {error && (
              <div
                className="orders-error-banner"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* ==================================
                EMPTY STATE
            ================================== */}

            {filteredOrders.length === 0 ? (
              <div className="orders-state orders-empty-state">
                <div className="orders-empty-icon">
                  <Icon
                    name="box"
                    size={35}
                  />
                </div>

                <h3>
                  {orders.length === 0
                    ? "No Orders Yet"
                    : "No Matching Orders"}
                </h3>

                <p>
                  {orders.length === 0
                    ? "Customer orders will appear here when they are available."
                    : "Try adjusting your search or filters."}
                </p>

                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (

              /* ==================================
                  ORDER CARDS
              ================================== */

              <div className="orders-list">

                {filteredOrders.map((order) => {
                  const address =
                    order.address || {};

                  const items =
                    Array.isArray(order.items)
                      ? order.items
                      : [];

                  const totalUnits =
                    items.reduce(
                      (total, item) =>
                        total +
                        (Number(item.quantity) || 0),
                      0
                    );

                  const isUpdating =
                    updatingId === order._id;

                  const isDeleting =
                    deletingId === order._id;

                  const isBusy =
                    Boolean(
                      updatingId || deletingId
                    );

                  const statusClass =
                    getStatusClass(order.status);

                  const deliveryAddress = [
                    address.street,
                    address.city,
                    address.region,
                    address.digitalAddress,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  const orderDate =
                    formatDate(
                      order.date ||
                      order.createdAt
                    );

                  return (
                    <article
                      key={order._id}
                      className={`orders-card ${
                        isDeleting
                          ? "orders-deleting"
                          : ""
                      }`}
                    >

                      {/* ORDER HEADER */}

                      <div className="orders-card-header">
                        <div className="orders-card-title">
                          <div className="orders-card-icon">
                            <Icon
                              name="box"
                              size={23}
                            />
                          </div>

                          <div>
                            <span className="orders-card-label">
                              CUSTOMER ORDER
                            </span>

                            <h3>
                              {address.recipientName ||
                                "Customer Order"}
                            </h3>

                            {orderDate && (
                              <p>{orderDate}</p>
                            )}
                          </div>
                        </div>

                        {/* STATUS BADGE */}

                        <span
                          className={`orders-status-badge ${statusClass}`}
                        >
                          <span className="orders-status-dot" />

                          {order.status ||
                            "Status unavailable"}
                        </span>
                      </div>

                      {/* ==================================
                          ORDER INFORMATION
                      ================================== */}

                      <div className="orders-card-content">

                        {/* CUSTOMER INFORMATION */}

                        <div className="orders-info-section">
                          <h4>
                            <Icon
                              name="user"
                              size={17}
                            />

                            Customer Information
                          </h4>

                          <div className="orders-info-row">
                            <span>Name</span>

                            <strong>
                              {address.recipientName ||
                                "N/A"}
                            </strong>
                          </div>

                          <div className="orders-info-row">
                            <span>
                              <Icon
                                name="phone"
                                size={15}
                              />

                              Phone
                            </span>

                            <strong>
                              {address.phone ||
                                "N/A"}
                            </strong>
                          </div>

                          <div className="orders-address-block">
                            <span>
                              <Icon
                                name="location"
                                size={16}
                              />

                              Delivery Address
                            </span>

                            <p>
                              {deliveryAddress ||
                                "Address unavailable"}
                            </p>
                          </div>
                        </div>

                        {/* PURCHASED PRODUCTS */}

                        <div className="orders-info-section">
                          <h4>
                            <Icon
                              name="box"
                              size={17}
                            />

                            Purchased Products
                          </h4>

                          <div className="orders-products-list">
                            {items.map(
                              (item, index) => (
                                <div
                                  key={`${order._id}-${index}`}
                                  className="orders-product-item"
                                >
                                  <div className="orders-product-icon">
                                    <Icon
                                      name="box"
                                      size={17}
                                    />
                                  </div>

                                  <div className="orders-product-details">
                                    <strong>
                                      {item.name ||
                                        "Product"}
                                    </strong>

                                    {item.description && (
                                      <p>
                                        {item.description}
                                      </p>
                                    )}
                                  </div>

                                  <span className="orders-product-quantity">
                                    ×
                                    {item.quantity ||
                                      1}
                                  </span>
                                </div>
                              )
                            )}

                            {items.length === 0 && (
                              <p className="orders-no-items">
                                No product details
                                available.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ==================================
                          PAYMENT SUMMARY
                      ================================== */}

                      <div className="orders-payment-summary">
                        <div className="orders-payment-detail">
                          <span>
                            <Icon
                              name="card"
                              size={16}
                            />

                            Payment Method
                          </span>

                          <strong>
                            {formatPaymentMethod(
                              order.paymentMethod
                            )}
                          </strong>
                        </div>

                        <div className="orders-payment-detail">
                          <span>
                            Items Ordered
                          </span>

                          <strong>
                            {totalUnits} Units
                          </strong>
                        </div>

                        <div className="orders-payment-detail amount">
                          <span>
                            Order Amount
                          </span>

                          <strong>
                            {formatPrice(
                              order.amount
                            )}
                          </strong>
                        </div>
                      </div>

                      {/* ==================================
                          ORDER STATUS ACTIONS
                      ================================== */}

                      <div className="orders-card-footer">

                        <div className="orders-status-control">

                          {/* UPDATED LABEL */}

                          <label
                            htmlFor={`order-status-${order._id}`}
                          >
                            Order Status
                          </label>

                          <select
                            id={`order-status-${order._id}`}
                            className={`orders-status-select ${statusClass}`}
                            value={
                              order.status || ""
                            }
                            onChange={(event) =>
                              statusHandler(
                                order._id,
                                event.target.value
                              )
                            }
                            disabled={isBusy}
                          >

                            {/* Preserve existing
                                Paid or other statuses */}

                            {order.status &&
                              !DELIVERY_STATUSES.includes(
                                order.status
                              ) && (
                                <option
                                  value={order.status}
                                >
                                  {order.status}
                                </option>
                              )}

                            {!order.status && (
                              <option value="">
                                Select a status
                              </option>
                            )}

                            {/* Delivery stages */}

                            {DELIVERY_STATUSES.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              )
                            )}
                          </select>

                          {isUpdating && (
                            <span className="orders-updating-text">
                              Updating status...
                            </span>
                          )}
                        </div>

                        {/* DELETE UNPAID DELIVERED COD ORDERS ONLY */}

                        {canDeleteOrder(order) && (
                          <button
                            type="button"
                            className="orders-delete-btn"
                            onClick={() =>
                              deleteOrder(order)
                            }
                            disabled={isBusy}
                          >
                            <Icon
                              name="delete"
                              size={17}
                            />

                            <span>
                              {isDeleting
                                ? "Deleting..."
                                : "Delete Order"}
                            </span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ==================================
            MANAGEMENT FOOTER
        ================================== */}

        {!loading && (
          <div className="orders-management-footer">
            <p>
              Showing{" "}
              <strong>
                {filteredOrders.length}
              </strong>{" "}
              of{" "}
              <strong>
                {orders.length}
              </strong>{" "}
              orders
            </p>

            <span>
              RIDWAN BUSINESS • ORDER MANAGEMENT
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

export default Orders;