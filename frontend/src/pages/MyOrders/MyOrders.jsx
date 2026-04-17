import React, { useEffect, useState, useContext } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/storecontext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);

const fetchOrders = async () => {
  try {
    const response = await axios.post(
      url + "/api/order/userorders",
      {},
      { headers: { token } }
    );
    console.log("Orders fetched:", response.data.data.orders); // 🔎 Debug
    setData(response.data.data.orders || []); // ✅ set array directly
  } catch (err) {
    console.error("Fetch orders error:", err.message);
  }
};

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

return (
  <div className='my-orders'>
    <h2>My Orders</h2>
    <div className="container">
      {data.map((order, index) => (
        <div key={index} className="my-orders-order">
          <img src={assets.parcel_icon} alt="parcel" />

          {/* Items list */}
          <p>
            {order.items && order.items.map((item, i) =>
              i === order.items.length - 1
                ? `${item.name} X ${item.quantity}`
                : `${item.name} X ${item.quantity}, `
            )}
          </p>

          {/* Amount formatted nicely */}
<p>
  {order.totalAmount !== undefined && !isNaN(order.totalAmount)
    ? new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(order.totalAmount))
    : "₵0.00"}
</p>



          {/* Items count */}
          <p>Items: {order.items?.length || 0}</p>

          {/* Status badge */}
          <p>
            <span>&#x25cf;</span>
            <b
              className={
                order.status === "Paid"
                  ? "status-paid"
                  : order.status === "Pending"
                  ? "status-pending"
                  : "status-failed"
              }
            >
              {order.status}
            </b>
          </p>

          {/* Track button */}
          <button>Track Order</button>
        </div>
      ))}
    </div>
  </div>
);
};

export default MyOrders;