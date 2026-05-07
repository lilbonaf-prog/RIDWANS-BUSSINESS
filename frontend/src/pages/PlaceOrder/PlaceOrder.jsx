import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext.jsx';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, discount, cartItems, phone_list, url, token } = useContext(StoreContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    region: '',
    digitalAddress: '',
    country: 'Ghana',
    phone: '',
    paymentMethod: 'Online'   // ✅ default to Online
  });

  const subtotal = Number(getTotalCartAmount());
  const total = subtotal - Number(discount || 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      const items = Object.entries(cartItems)
        .filter(([id, qty]) => qty > 0)
        .map(([id, qty]) => {
          const product = phone_list.find((p) => p._id === id);
          return {
            productId: id,
            name: product?.name || "Unknown",
            quantity: qty,
            price: product?.price || 0
          };
        });

      const address = {
        recipientName: formData.firstName + " " + formData.lastName,
        street: formData.street,
        city: formData.city,
        region: formData.region,
        digitalAddress: formData.digitalAddress,
        phone: formData.phone,
        email: formData.email,
        country: formData.country
      };

const response = await axios.post(
  url + "/api/order/place",
  {
    email: formData.email,
    items,
    address,
    paymentMethod: formData.paymentMethod
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,   // ✅ correct header
      "Content-Type": "application/json"
    }
  }
);


      if (response.data.success) {
        if (formData.paymentMethod === "CashOnDelivery") {
          alert("Order placed successfully. Pay on delivery.");
          navigate("/myorders");
        } else {
          window.location.href = response.data.authorization_url;
        }
      } else {
        alert("Payment initialization failed");
      }
    } catch (error) {
      console.error("Place order error:", error.response?.data || error.message);
      alert("Error connecting to payment");
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);

  return (
    <form className="place-order" onSubmit={handlePayment}>
      {/* Left side: delivery info */}
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multy-fields">
          <input required type="text" name="firstName" placeholder="First name" onChange={handleChange} />
          <input required type="text" name="lastName" placeholder="Last name" onChange={handleChange} />
        </div>
        <input required type="email" name="email" placeholder="Email address" onChange={handleChange} />
        <input required type="text" name="street" placeholder="Street / Area / Landmark" onChange={handleChange} />
        <div className="multy-fields">
          <input required type="text" name="city" placeholder="City / Town" onChange={handleChange} />
          <input required type="text" name="region" placeholder="Region" onChange={handleChange} />
        </div>
        <input required type="text" name="digitalAddress" placeholder="Digital Address (GhanaPost GPS)" onChange={handleChange} />
        <input required type="text" name="country" placeholder="Country" value="Ghana" readOnly />
        <input required type="text" name="phone" placeholder="Phone" onChange={handleChange} />
      </div>

      {/* Right side: cart totals */}
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>GH₵{subtotal}</p>
          </div>
          {discount > 0 && (
            <>
              <hr />
              <div className="cart-total-details">
                <p>Discount</p>
                <p>- GH₵{discount}</p>
              </div>
            </>
          )}
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <b>GH₵{total}</b>
          </div>

          {/* ✅ Payment Method Selection moved here */}
          <hr />
          <div className="cart-total-details">
            <p>Payment Method</p>
          </div>
          <div className="payment-method-card">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="Online"
                checked={formData.paymentMethod === "Online"}
                onChange={handleChange}
              />
              Pay Online (Paystack) 💳
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="CashOnDelivery"
                checked={formData.paymentMethod === "CashOnDelivery"}
                onChange={handleChange}
              />
              Payment on Delivery 🚚
            </label>
          </div>

          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
