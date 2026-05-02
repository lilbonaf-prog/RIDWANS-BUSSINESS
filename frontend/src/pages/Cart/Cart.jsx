import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/storecontext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, phone_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);

  const navigate = useNavigate();

  // ✅ Subtotal and total without delivery fee
  const subtotal = getTotalCartAmount();
  const total = subtotal;

  return (
    <div className='cart'>
      {/* Cart Items */}
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {phone_list.map((item) => {
          const quantity = cartItems[item._id] || 0;
          if (quantity > 0) {
            return (
              <div key={item._id}>
                <div className='cart-items-title cart-items-item'>
                  <img src={url + "/images/" + item.image} alt={item.name} />
                  <p>{item.name}</p>
                  <p>GH₵{item.price}</p>
                  <p>{quantity}</p>
                  <p>GH₵{item.price * quantity}</p>
                  <p onClick={() => removeFromCart(item._id)} className='cross'>X</p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Flex bottom section */}
      <div className="cart-bottom">
        {/* Cart Totals under items */}
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>GH₵{subtotal}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <b>GH₵{total}</b>
          </div>
          <button onClick={() => navigate("/order")}>PROCEED TO CHECKOUT</button>
        </div>

        {/* Promo Code aligned under remove */}
        <div className="cart-promocode">
          <p>If you have a promo code, enter it here</p>
          <div className="cart-promocode-input">
            <input type="text" placeholder='Promo code' />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
