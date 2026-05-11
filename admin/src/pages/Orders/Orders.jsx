import React, { useState, useEffect } from 'react';
import './Orders.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");

  // Get token from localStorage
  const token = localStorage.getItem("adminToken");

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (err) {
      console.error("Fetch orders error:", err.message);
      toast.error("Server error");
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        url + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteOrder = async (orderId, recipientName) => {
    if (!window.confirm(`Delete order for ${recipientName}?`)) return;

    setOrders(prev =>
      prev.map(o => o._id === orderId ? { ...o, deleting: true } : o)
    );

    setTimeout(async () => {
      try {
        const response = await axios.delete(url + "/api/order/delete/" + orderId, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          toast.success(`Order for ${recipientName} deleted`);
          await fetchAllOrders();
        } else {
          toast.error("Failed to delete order");
        }
      } catch (err) {
        toast.error("Server error");
      }
    }, 400);
  };

  useEffect(() => {
    // Initial fetch
    fetchAllOrders();

    // Polling every 5 seconds
    const interval = setInterval(fetchAllOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter(order =>
    filter === "All" ? true : order.paymentMethod === filter
  );

  return (
    <div className="order add">
      <h3>Order Page</h3>

      <div className="filter-bar">
        <label>Filter by Payment Method: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="CashOnDelivery">Cash on Delivery</option>
          <option value="Online">Online (Paystack)</option>
        </select>
      </div>

      <div className="order-list">
        {filteredOrders.map((order, index) => (
          <div
            key={index}
            className={`order-item ${order.deleting ? "fade-out" : ""}`}
          >
            <img src={assets.parcel_icon} alt="" />
            <div>
              {/* ✅ Show product name + description */}
              <div className="order-item-products">
                {order.items.map((item, i) => (
                  <div key={i} className="order-product-detail">
                    <p className="order-item-product">
                      {item.name} x {item.quantity}
                    </p>
                    {item.description && (
                      <p className="order-item-description">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <p className="order-item-name">{order.address.recipientName}</p>
              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.region},{" "}
                  {order.address.digitalAddress}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
              <p className="order-item-payment">
                Payment Method: {order.paymentMethod === "CashOnDelivery" ? "Cash on Delivery" : "Online (Paystack)"}
              </p>

              <p className={`order-status 
                ${order.status === "Product Processing" ? "status-processing" : 
                 order.status === "Out for delivery" ? "status-delivery" : 
                 order.status === "Delivered" ? "status-delivered" : ""}`}>
                Status: {order.status}
              </p>
            </div>

            <p>Items: {order.items.length}</p>
            <p>GHS {order.amount}</p>
            <select
              className={`status-select 
                ${order.status === "Product Processing" ? "status-processing" : 
                 order.status === "Out for delivery" ? "status-delivery" : 
                 order.status === "Delivered" ? "status-delivered" : ""}`}
              value={order.status}
              onChange={(event) => statusHandler(event, order._id)}
            >
              <option value="Product Processing">Product Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>

            {order.status === "Delivered" && (
              <button
                className="delete-btn"
                onClick={() => deleteOrder(order._id, order.address.recipientName)}
              >
                🗑 Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
