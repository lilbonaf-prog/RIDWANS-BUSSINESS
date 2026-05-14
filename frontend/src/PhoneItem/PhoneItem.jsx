import React, { useContext } from 'react';
import './PhoneItem.css';
import { assets } from '../assets/assets';
import { StoreContext } from "../context/StoreContext.jsx";
import { useNavigate } from "react-router-dom";

const PhoneItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const navigate = useNavigate();

  if (!id || !name || !price || !image) {
    return <div className="phone-item">Invalid product data</div>;
  }

  // Navigate to product detail page
  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="phone-item" onClick={handleCardClick}>
      <div className="phone-item-image-container">
        <img
          className="phone-item-image"
          src={image}
          alt={name || "phone"}
        />
        {!cartItems?.[id] ? (
          <img
            className="add"
            onClick={(e) => {
              e.stopPropagation(); // ✅ prevent navigation
              addToCart(id);
            }}
            src={assets.add_icon_white}
            alt="add"
          />
        ) : (
          <div className="phone-item-counter" onClick={(e) => e.stopPropagation()}>
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt="remove"
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={() => addToCart(id)}
              src={assets.add_icon_green}
              alt="add"
            />
          </div>
        )}
      </div>
      <div className="phone-item-info">
        <div className="phone-item-rating">
          <p>{name}</p>
          {assets.rating_stars && <img src={assets.rating_stars} alt="rating" />}
        </div>
        {description && <p className="phone-item-desc">{description}</p>}
        <p className="phone-item-price">GH₵{price}</p>
      </div>
    </div>
  );
};

export default PhoneItem;
