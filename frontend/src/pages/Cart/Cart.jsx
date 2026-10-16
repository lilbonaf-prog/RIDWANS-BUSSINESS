import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Cart3,
  Plus,
  Dash,
  Trash,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Bag,
} from "react-bootstrap-icons";

import { StoreContext } from "../../context/StoreContext";

import "./Cart.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM SHOPPING CART
// ==========================================

// Ghana cedi currency formatter

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPrice = (value) => {
  const amount = Number(
    String(value ?? 0).replace(/,/g, "")
  );

  return currencyFormatter.format(
    Number.isFinite(amount) ? amount : 0
  );
};

// ==========================================
// CART COMPONENT
// ==========================================

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    phone_list,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
  } = useContext(StoreContext);

  // Track which product is currently updating.

  const [busyItemId, setBusyItemId] = useState(null);

  // ========================================
  // GET PRODUCTS IN CART
  // ========================================

  const products = Array.isArray(phone_list)
    ? phone_list
    : [];

  const cartProducts = products
    .filter((product) => {
      return Number(cartItems?.[product._id] || 0) > 0;
    })
    .map((product) => ({
      ...product,
      quantity: Number(cartItems[product._id]),
    }));

  // ========================================
  // CART INFORMATION
  // ========================================

  const totalItems = cartProducts.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const subtotal = Number(getTotalCartAmount()) || 0;

  const total = subtotal;

  const isEmpty = cartProducts.length === 0;

  // ========================================
  // INCREASE PRODUCT QUANTITY
  // ========================================

  const handleIncrease = async (productId) => {
    if (busyItemId) return;

    setBusyItemId(productId);

    try {
      await addToCart(productId);
    } catch (error) {
      console.error(
        "Unable to increase quantity:",
        error
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // ========================================
  // DECREASE PRODUCT QUANTITY
  // ========================================

  const handleDecrease = async (productId) => {
    if (busyItemId) return;

    setBusyItemId(productId);

    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error(
        "Unable to decrease quantity:",
        error
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // ========================================
  // REMOVE ENTIRE PRODUCT FROM CART
  // ========================================

  const handleRemoveProduct = async (
    productId,
    quantity
  ) => {
    if (busyItemId) return;

    setBusyItemId(productId);

    try {
      // The existing removeFromCart function
      // removes one unit at a time.
      //
      // Repeating the operation removes all
      // units without changing StoreContext
      // or the backend cart API.

      for (let index = 0; index < quantity; index++) {
        await removeFromCart(productId);
      }
    } catch (error) {
      console.error(
        "Unable to remove product:",
        error
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // ========================================
  // RENDER SHOPPING CART
  // ========================================

  return (
    <main className="cart">

      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <div className="rb-cart-header">

        <div>

          <span className="rb-cart-eyebrow">
            RIDWAN BUSINESS
          </span>

          <h1>
            My Shopping Cart
          </h1>

          <p>
            Review your selected products before checkout.
          </p>

        </div>

        <div className="rb-cart-count">

          <Cart3 size={19} />

          <span>
            {totalItems}{" "}
            {totalItems === 1 ? "Item" : "Items"}
          </span>

        </div>

      </div>

      {/* ====================================
          EMPTY SHOPPING CART
      ==================================== */}

      {isEmpty ? (

        <div className="rb-cart-empty">

          <div className="rb-cart-empty-icon">

            <Bag size={45} />

          </div>

          <h2>
            Your Shopping Cart Is Empty
          </h2>

          <p>
            Looks like you haven't added any products yet.
            Explore our collection of smartphones, gadgets,
            and accessories.
          </p>

          <Link
            to="/products"
            className="rb-cart-shop-btn"
          >

            Start Shopping

            <ArrowRight size={18} />

          </Link>

        </div>

      ) : (

        /* ==================================
            CART WITH PRODUCTS
        ================================== */

        <div className="rb-cart-layout">

          {/* ==================================
              LEFT SIDE: CART PRODUCTS
          ================================== */}

          <section className="rb-cart-products">

            {/* PRODUCTS HEADING */}

            <div className="rb-cart-products-heading">

              <h2>
                Cart Items
              </h2>

              <span>
                {cartProducts.length}{" "}
                {cartProducts.length === 1
                  ? "Product"
                  : "Products"}
              </span>

            </div>

            {/* ==================================
                TABLE HEADER
            ================================== */}

            <div className="rb-cart-table-header">

              <span>Product</span>

              <span>Price</span>

              <span>Quantity</span>

              <span>Total</span>

              <span aria-hidden="true"></span>

            </div>

            {/* ==================================
                PRODUCT ROWS
            ================================== */}

            <div className="rb-cart-list">

              {cartProducts.map((product) => {
                const productId = product._id;

                const quantity = product.quantity;

                const unitPrice =
                  Number(
                    String(product.price ?? 0).replace(
                      /,/g,
                      ""
                    )
                  ) || 0;

                const lineTotal =
                  unitPrice * quantity;

                const isBusy =
                  busyItemId === productId;

                return (

                  <div
                    key={productId}
                    className="rb-cart-row"
                  >

                    {/* ======================
                        PRODUCT INFORMATION
                    ====================== */}

                    <div className="rb-cart-product">

                      {/* PRODUCT IMAGE */}

                      <Link
                        to={`/product/${productId}`}
                        className="rb-cart-image-link"
                      >

                        <img
                          src={product.image}
                          alt={product.name}
                          className="rb-cart-image"
                        />

                      </Link>

                      {/* PRODUCT DETAILS */}

                      <div className="rb-cart-product-info">

                        <span className="rb-cart-category">
                          {product.category || "Product"}
                        </span>

                        <Link
                          to={`/product/${productId}`}
                          className="rb-cart-product-name"
                        >
                          {product.name}
                        </Link>

                        <span className="rb-cart-mobile-price">
                          {formatPrice(unitPrice)}
                        </span>

                      </div>

                    </div>

                    {/* ======================
                        UNIT PRICE
                    ====================== */}

                    <div className="rb-cart-unit-price">

                      {formatPrice(unitPrice)}

                    </div>

                    {/* ======================
                        QUANTITY CONTROLS
                    ====================== */}

                    <div className="rb-cart-quantity">

                      <button
                        type="button"
                        className="rb-cart-quantity-btn"
                        onClick={() =>
                          handleDecrease(productId)
                        }
                        disabled={isBusy}
                        aria-label={`Decrease quantity of ${product.name}`}
                      >

                        <Dash size={17} />

                      </button>

                      <span
                        className="rb-cart-quantity-value"
                        aria-label={`Quantity: ${quantity}`}
                      >
                        {quantity}
                      </span>

                      <button
                        type="button"
                        className="rb-cart-quantity-btn"
                        onClick={() =>
                          handleIncrease(productId)
                        }
                        disabled={isBusy}
                        aria-label={`Increase quantity of ${product.name}`}
                      >

                        <Plus size={17} />

                      </button>

                    </div>

                    {/* ======================
                        PRODUCT TOTAL
                    ====================== */}

                    <div className="rb-cart-line-total">

                      {formatPrice(lineTotal)}

                    </div>

                    {/* ======================
                        REMOVE PRODUCT
                    ====================== */}

                    <button
                      type="button"
                      className="rb-cart-remove"
                      onClick={() =>
                        handleRemoveProduct(
                          productId,
                          quantity
                        )
                      }
                      disabled={isBusy}
                      title="Remove product"
                      aria-label={`Remove all ${product.name} from cart`}
                    >

                      <Trash size={18} />

                    </button>

                  </div>

                );
              })}

            </div>

            {/* ==================================
                CONTINUE SHOPPING
            ================================== */}

            <Link
              to="/products"
              className="rb-cart-continue"
            >

              <ArrowLeft size={17} />

              Continue Shopping

            </Link>

          </section>

          {/* ==================================
              RIGHT SIDE: ORDER SUMMARY
          ================================== */}

          <aside className="rb-cart-sidebar">

            {/* ==================================
                ORDER SUMMARY CARD
            ================================== */}

            <div className="rb-cart-summary">

              <div className="rb-cart-summary-heading">

                <h2>
                  Order Summary
                </h2>

                <span>
                  {totalItems}{" "}
                  {totalItems === 1 ? "Item" : "Items"}
                </span>

              </div>

              {/* SUBTOTAL */}

              <div className="rb-cart-summary-row">

                <span>Subtotal</span>

                <strong>
                  {formatPrice(subtotal)}
                </strong>

              </div>

              {/* DELIVERY NOTE */}

              <div className="rb-cart-summary-row">

                <span>Delivery Fee</span>

                <span className="rb-cart-muted">
                  Not included
                </span>

              </div>

              <hr />

              {/* TOTAL */}

              <div className="rb-cart-summary-total">

                <span>
                  Total
                </span>

                <strong>
                  {formatPrice(total)}
                </strong>

              </div>

              <p className="rb-cart-summary-note">
                No delivery fee has been added to this total.
              </p>

              {/* CHECKOUT BUTTON */}

              <button
                type="button"
                className="rb-cart-checkout-btn"
                onClick={() => navigate("/order")}
                disabled={Boolean(busyItemId)}
              >

                Proceed to Checkout

                <ArrowRight size={18} />

              </button>

              {!token && (

                <p className="rb-cart-login-note">
                  You will need to sign in before
                  completing checkout.
                </p>

              )}

              {/* TRUST INDICATOR */}

              <div className="rb-cart-trust">

                <ShieldCheck size={19} />

                <span>
                  Shop with confidence at Ridwan Business.
                </span>

              </div>

            </div>

            {/* ==================================
                PROMO CODE INFORMATION
            ================================== */}

            <div className="rb-cart-promo">

              <div className="rb-cart-promo-heading">

                <h3>
                  Promo Code
                </h3>

                <span>
                  Coming Soon
                </span>

              </div>

              <p>
                Discount codes aren't available yet.
                We'll introduce this feature in a
                future update.
              </p>

            </div>

          </aside>

        </div>

      )}

    </main>
  );
};

export default Cart;