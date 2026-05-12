import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

const PaymentSuccess = () => {
  const [status, setStatus] = useState("Verifying payment...");
  const [order, setOrder] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const reference = queryParams.get("reference");

    if (reference) {
      const verifyPayment = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:4000/api/order/verify?reference=${reference}`,
            {
              headers: {
                token,
                "Content-Type": "application/json"
              }
            }
          );

          if (response.data.success) {
            setStatus("✅ Payment successful! Thank you for your order.");
            setOrder(response.data.order);

            const interval = setInterval(() => {
              setCountdown(prev => {
                if (prev <= 1) {
                  clearInterval(interval);
                  navigate("/myorders");
                }
                return prev - 1;
              });
            }, 1000);
          } else {
            setStatus("❌ Payment not successful. Please try again.");
          }
        } catch (error) {
          console.error("Verify error:", error.response?.data || error.message);
          setStatus("⚠️ Error verifying payment. Contact support.");
        }
      };

      verifyPayment();
    } else {
      setStatus("⚠️ No payment reference found.");
    }
  }, [navigate]);

  return (
    <div className="payment-success">
      <h2>Payment Status</h2>
      <p>{status}</p>

      {order && (
        <div className="order-summary">
          <h3>Order Summary</h3>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total Amount:</strong> GH₵{order.amount}</p>

          <h4>Items:</h4>
          <ul>
            {order.items?.map((item, idx) => (
              <li key={idx}>
                {item.name || "Item"} × {item.quantity} (GH₵{item.price})
              </li>
            ))}
          </ul>

          <h4>Delivery Info:</h4>
          {order.address && (
            <div className="delivery-info">
              <p><strong>Name:</strong> {order.address.recipientName}</p>
              <p><strong>Address:</strong> {order.address.street}, {order.address.city}, {order.address.region}</p>
              {order.address.postalCode && <p><strong>Postal Code:</strong> {order.address.postalCode}</p>}
              <p><strong>Phone:</strong> {order.address.phone}</p>
              {order.address.email && <p><strong>Email:</strong> {order.address.email}</p>}
              {order.address.notes && <p><strong>Notes:</strong> {order.address.notes}</p>}
            </div>
          )}

          <p className="countdown-text">
            Redirecting to My Orders in <strong>{countdown}</strong> seconds...
          </p>

          <div className="actions">
            <button onClick={() => navigate("/myorders")} className="btn-orders">
              Go to My Orders →
            </button>
            <a href="/" className="btn-home">← Back to Home</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
