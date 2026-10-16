import React, { useContext } from "react";
import "./PhoneItem.css";

import { Link } from "react-router-dom";
import {
  CartPlus,
  Plus,
  Dash,
  ArrowRight,
} from "react-bootstrap-icons";

import { StoreContext } from "../context/StoreContext.jsx";

const PhoneItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart } =
    useContext(StoreContext);

  // Validate product information
  if (
    !id ||
    !name ||
    price === undefined ||
    price === null ||
    !image
  ) {
    return (
      <div className="phone-item">
        <p className="phone-item-error">
          Invalid product data
        </p>
      </div>
    );
  }

  // Current cart quantity
  const quantity = Number(cartItems?.[id] || 0);

  // Format Ghana cedi price
  const numericPrice = Number(
    String(price).replace(/,/g, "")
  );

  const formattedPrice = Number.isFinite(numericPrice)
    ? new Intl.NumberFormat("en-GH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericPrice)
    : price;

  const productLink = `/product/${id}`;

  return (
    <article className="phone-item">

      {/* PRODUCT IMAGE */}
      <Link
        to={productLink}
        className="phone-item-image-link"
        aria-label={`View details for ${name}`}
      >
        <div className="phone-item-image-container">
          <img
            className="phone-item-image"
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>

      {/* PRODUCT INFORMATION */}
      <div className="phone-item-info">

        <div className="phone-item-details">

          <span className="phone-item-category-label">
            TECH ESSENTIALS
          </span>

          <Link
            to={productLink}
            className="phone-item-name"
          >
            {name}
          </Link>

          {description && (
            <p className="phone-item-desc">
              {description}
            </p>
          )}

        </div>

        {/* PRICE AND CART */}
        <div className="phone-item-bottom">

          <p className="phone-item-price">
            GH₵ {formattedPrice}
          </p>

          {quantity === 0 ? (
            <button
              type="button"
              className="phone-item-add-btn"
              onClick={() => addToCart(id)}
              aria-label={`Add ${name} to cart`}
            >
              <CartPlus size={19} />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="phone-item-counter">

              <button
                type="button"
                className="phone-item-quantity-btn"
                onClick={() => removeFromCart(id)}
                aria-label={`Remove one ${name} from cart`}
              >
                <Dash size={19} />
              </button>

              <span
                className="phone-item-quantity"
                aria-live="polite"
              >
                {quantity}
              </span>

              <button
                type="button"
                className="phone-item-quantity-btn"
                onClick={() => addToCart(id)}
                aria-label={`Add one more ${name} to cart`}
              >
                <Plus size={19} />
              </button>

            </div>
          )}

          {/* VIEW DETAILS */}
          <Link
            to={productLink}
            className="phone-item-details-link"
          >
            View Details
            <ArrowRight size={15} />
          </Link>

        </div>

      </div>

    </article>
  );
};

export default PhoneItem;