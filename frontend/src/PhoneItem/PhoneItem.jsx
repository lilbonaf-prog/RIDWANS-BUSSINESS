import React, { useContext } from 'react';
import './PhoneItem.css';
import { assets } from '../assets/assets';
import { StoreContext } from "../context/StoreContext.jsx";

const PhoneItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  // Guard against missing props or context
  if (!id || !name || !price || !image) {
    return <div className="phone-item">Invalid product data</div>;
  }

  return (
    <div className="phone-item">
      <div className="phone-item-image-container">
        <img
          className="phone-item-image"
          src={url ? url + "/images/" + image : ""}
          alt={name || "phone"}
        />
        {!cartItems?.[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt="add"
          />
        ) : (
          <div className="phone-item-counter">
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