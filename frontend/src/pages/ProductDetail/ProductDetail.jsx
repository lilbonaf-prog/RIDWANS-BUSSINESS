import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  CartPlus,
  Plus,
  Dash,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  House,
  ChevronRight,
  Bag,
} from "react-bootstrap-icons";

import { StoreContext } from "../../context/StoreContext";
import PhoneItem from "../../PhoneItem/PhoneItem";

import "./ProductDetail.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM PRODUCT DETAILS PAGE
// ==========================================

// ==========================================
// GHANA CEDI FORMATTER
// ==========================================

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPrice = (price) => {
  const amount = Number(
    String(price ?? 0).replace(/,/g, "")
  );

  return currencyFormatter.format(
    Number.isFinite(amount) ? amount : 0
  );
};

// ==========================================
// SELECTED PRODUCT CONTENT
// ==========================================

const ProductDetailContent = ({
  product,
  products,
  addToCart,
}) => {
  // ========================================
  // QUANTITY STATE
  // ========================================

  const [quantity, setQuantity] = useState(1);

  const [isAdding, setIsAdding] = useState(false);

  const [addedMessage, setAddedMessage] = useState("");

  // ========================================
  // PRODUCT INFORMATION
  // ========================================

  const productName = product.name || "Product";

  const productCategory = product.category || "Product";

  const productDescription =
    product.description ||
    "More information about this product will be available soon.";

  // ========================================
  // RELATED PRODUCTS
  // ========================================

  const relatedProducts = products
    .filter(
      (item) =>
        item.category === product.category &&
        item._id !== product._id
    )
    .slice(0, 4);

  // ========================================
  // INCREASE QUANTITY
  // ========================================

  const increaseQuantity = () => {
    setQuantity((previous) =>
      Math.min(previous + 1, 99)
    );

    setAddedMessage("");
  };

  // ========================================
  // DECREASE QUANTITY
  // ========================================

  const decreaseQuantity = () => {
    setQuantity((previous) =>
      Math.max(previous - 1, 1)
    );

    setAddedMessage("");
  };

  // ========================================
  // ADD PRODUCTS TO CART
  // ========================================

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);

    setAddedMessage("");

    try {
      // Existing StoreContext adds one item
      // per call. Repeat for selected quantity.

      for (let index = 0; index < quantity; index++) {
        await addToCart(product._id);
      }

      setAddedMessage(
        `${quantity} ${
          quantity === 1 ? "item" : "items"
        } added to your cart.`
      );
    } catch (error) {
      console.error("Add to cart error:", error);

      setAddedMessage(
        "Unable to complete the cart update. Please check your cart."
      );
    } finally {
      setIsAdding(false);
    }
  };

  // ========================================
  // RENDER PRODUCT DETAILS
  // ========================================

  return (
    <main className="product-detail">

      {/* ====================================
          BREADCRUMB NAVIGATION
      ==================================== */}

      <nav
        className="pd-breadcrumb"
        aria-label="Breadcrumb"
      >

        <Link to="/">
          <House size={14} />
          Home
        </Link>

        <ChevronRight size={12} />

        <Link to="/products">
          Products
        </Link>

        <ChevronRight size={12} />

        <span aria-current="page">
          {productName}
        </span>

      </nav>

      {/* ====================================
          MAIN PRODUCT SECTION
      ==================================== */}

      <section className="pd-product-layout">

        {/* ==================================
            LEFT SIDE - PRODUCT IMAGE
        ================================== */}

        <div className="pd-image-section">

          <div className="pd-main-image">

            <span className="pd-image-badge">
              {productCategory}
            </span>

            <img
              src={product.image}
              alt={productName}
              className="pd-product-image"
            />

          </div>

          {/* IMAGE INFORMATION */}

          <div className="pd-image-footer">

            <CheckCircle size={17} />

            <span>
              Explore our {productCategory} collection
            </span>

          </div>

        </div>

        {/* ==================================
            RIGHT SIDE - PRODUCT DETAILS
        ================================== */}

        <div className="pd-info-section">

          {/* SMALL LABEL */}

          <div className="pd-top-label">

            <span className="pd-label-line" />

            RIDWAN BUSINESS COLLECTION

          </div>

          {/* PRODUCT CATEGORY */}

          <span className="pd-category">
            {productCategory}
          </span>

          {/* PRODUCT NAME */}

          <h1 className="pd-product-title">
            {productName}
          </h1>

          {/* PRODUCT PRICE */}

          <div className="pd-price-section">

            <span className="pd-price-label">
              Product Price
            </span>

            <div className="pd-price">
              {formatPrice(product.price)}
            </div>

            <span className="pd-currency-note">
              Price displayed in Ghana Cedis (GHS)
            </span>

          </div>

          {/* ==================================
              PRODUCT DESCRIPTION
          ================================== */}

          <div className="pd-description-section">

            <h2>
              Product Overview
            </h2>

            <p>
              {productDescription}
            </p>

          </div>

          {/* ==================================
              QUANTITY SELECTOR
          ================================== */}

          <div className="pd-purchase-section">

            <div className="pd-quantity-header">

              <span>
                Select Quantity
              </span>

            </div>

            <div className="pd-quantity-control">

              {/* DECREASE */}

              <button
                type="button"
                className="pd-quantity-btn"
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || isAdding}
                aria-label="Decrease quantity"
              >

                <Dash size={19} />

              </button>

              {/* QUANTITY DISPLAY */}

              <span
                className="pd-quantity-value"
                aria-live="polite"
              >
                {quantity}
              </span>

              {/* INCREASE */}

              <button
                type="button"
                className="pd-quantity-btn"
                onClick={increaseQuantity}
                disabled={quantity >= 99 || isAdding}
                aria-label="Increase quantity"
              >

                <Plus size={19} />

              </button>

            </div>

          </div>

          {/* ==================================
              ACTION BUTTONS
          ================================== */}

          <div className="pd-action-buttons">

            {/* ADD TO CART */}

            <button
              type="button"
              className="pd-add-to-cart"
              onClick={handleAddToCart}
              disabled={isAdding}
            >

              <CartPlus size={21} />

              {isAdding
                ? "Adding..."
                : "Add to Cart"}

            </button>

            {/* VIEW CART */}

            <Link
              to="/cart"
              className="pd-view-cart"
            >

              <Bag size={19} />

              View Cart

            </Link>

          </div>

          {/* ==================================
              CART CONFIRMATION
          ================================== */}

          {addedMessage && (

            <div
              className="pd-cart-message"
              role="status"
            >

              <CheckCircle size={18} />

              <span>
                {addedMessage}
              </span>

            </div>

          )}

          {/* ==================================
              CONTINUE SHOPPING
          ================================== */}

          <Link
            to="/products"
            className="pd-continue-shopping"
          >

            <ArrowLeft size={16} />

            Continue Shopping

          </Link>

        </div>

      </section>

      {/* ====================================
          ADDITIONAL PRODUCT INFORMATION
      ==================================== */}

      <section className="pd-overview-card">

        <div className="pd-overview-heading">

          <span className="pd-section-tag">
            PRODUCT INFORMATION
          </span>

          <h2>
            About This Product
          </h2>

        </div>

        <p>
          {productDescription}
        </p>

      </section>

      {/* ====================================
          RELATED PRODUCTS
      ==================================== */}

      {relatedProducts.length > 0 && (

        <section className="related-products">

          {/* SECTION HEADING */}

          <div className="pd-related-header">

            <div>

              <span className="pd-section-tag">
                YOU MAY ALSO LIKE
              </span>

              <h2>
                Related Products
              </h2>

              <p>
                Explore more products from the same category.
              </p>

            </div>

            {/* BROWSE ALL PRODUCTS */}

            <Link
              to="/products"
              className="pd-browse-all"
            >

              Browse All

              <ArrowRight size={17} />

            </Link>

          </div>

          {/* RELATED PRODUCTS GRID */}

          <div className="related-products-list">

            {relatedProducts.map((item) => (

              <PhoneItem
                key={item._id}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
              />

            ))}

          </div>

        </section>

      )}

    </main>
  );
};

// ==========================================
// MAIN PRODUCT DETAIL COMPONENT
// ==========================================

const ProductDetail = () => {

  // ========================================
  // GET PRODUCT ID
  // ========================================

  const { id } = useParams();

  // ========================================
  // STORE CONTEXT
  // ========================================

  const {
    phone_list,
    addToCart,
  } = useContext(StoreContext);

  // ========================================
  // SCROLL TO TOP WHEN PRODUCT CHANGES
  // ========================================

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // ========================================
  // GET PRODUCTS
  // ========================================

  const products = Array.isArray(phone_list)
    ? phone_list
    : [];

  // ========================================
  // FIND CURRENT PRODUCT
  // ========================================

  const product = products.find(
    (item) => item._id === id
  );

  // ========================================
  // PRODUCT LIST IS STILL EMPTY
  // ========================================

  if (products.length === 0) {
    return (

      <div className="pd-message-page">

        <h2>
          Loading Product Details...
        </h2>

        <p>
          Please wait while we load our products.
        </p>

      </div>

    );
  }

  // ========================================
  // PRODUCT NOT FOUND
  // ========================================

  if (!product) {
    return (

      <div className="pd-message-page">

        <h2>
          Product Not Found
        </h2>

        <p>
          Sorry, the requested product could not be found.
        </p>

        <Link to="/products">
          Browse Products
        </Link>

      </div>

    );
  }

  // ========================================
  // RENDER SELECTED PRODUCT
  // ========================================

  return (

    <ProductDetailContent
      key={product._id}
      product={product}
      products={products}
      addToCart={addToCart}
    />

  );
};

export default ProductDetail;