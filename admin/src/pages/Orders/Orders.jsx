import React, { useState, useEffect } from 'react';
import './Orders.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) {
        setOrders(response.data.data);
        console.log("Orders:", response.data.data);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (err) {
      console.error("Fetch orders error:", err.message);
      toast.error("Server error");
    }
  };

  // const updateOrderStatus = async (orderId, status) => {
  //   try {
  //     const response = await axios.post(url + "/api/order/update", {
  //       orderId,
  //       status
  //     });
  //     if (response.data.success) {
  //       toast.success("Order status updated");
  //       fetchAllOrders();
  //     } else {
  //       toast.error("Failed to update status");
  //     }
  //   } catch (err) {
  //     console.error("Update order error:", err.message);
  //     toast.error("Server error");
  //   }
  // };

  const statusHandler = async (event,orderId) => {
    const response = await axios.post(url+"/api/order/status",{
      orderId,
      status:event.target.value
    })
    if (response.data.success) {
      await fetchAllOrders();
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-product">
                {order.items.map((item, i) =>
                  i === order.items.length - 1
                    ? `${item.name} x ${item.quantity}`
                    : `${item.name} x ${item.quantity}, `
                )}
              </p>
              <p className="order-item-name">{order.address.recipientName}</p>
              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.region},{" "}
                  {order.address.digitalAddress}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>GHS {order.amount}</p>
            <select
              value={order.status}
              onChange={(event) => statusHandler(event,order._id)}
            >
              <option value="Product Processing">Product Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;