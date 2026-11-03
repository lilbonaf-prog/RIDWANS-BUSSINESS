import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { assets } from "../../assets/assets";

import "./Add.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM ADD PRODUCT PAGE
// ==========================================

const initialFormData = {
  name: "",
  description: "",
  price: "",
  category: "",
};

// ==========================================
// PRODUCT CATEGORIES
// ==========================================

const categories = [
  { value: "Apple", label: "Apple" },
  { value: "Samsung", label: "Samsung" },
  { value: "Tecno", label: "Tecno" },
  { value: "Infinix", label: "Infinix" },
  { value: "Itel", label: "Itel" },
  { value: "Redmi", label: "Redmi" },
  { value: "Accessories", label: "Accessories" },
];

// ==========================================
// ADD PRODUCT COMPONENT
// ==========================================

const Add = ({ url }) => {
  const [image, setImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState(initialFormData);

  const fileInputRef = useRef(null);

  // ========================================
  // IMAGE PREVIEW
  // ========================================

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);

    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [image]);

  // ========================================
  // HANDLE INPUT CHANGES
  // ========================================

  const onChangeHandler = (event) => {
    const { name, value } = event.target;

    setData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ========================================
  // HANDLE IMAGE SELECTION
  // ========================================

  const imageHandler = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");

      event.target.value = "";

      return;
    }

    setImage(file);
  };

  // ========================================
  // RESET PRODUCT FORM
  // ========================================

  const resetForm = () => {
    setData(initialFormData);

    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ========================================
  // FORMAT PRODUCT PRICE
  // ========================================

  const formatPrice = (price) => {
    const amount = Number(price);

    if (!price || !Number.isFinite(amount)) {
      return "GH₵0.00";
    }

    return `GH₵${amount.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ========================================
  // SUBMIT PRODUCT
  // ========================================

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (loading) return;

    // Validate required fields

    if (
      !data.name.trim() ||
      !data.description.trim() ||
      !data.price ||
      !data.category ||
      !image
    ) {
      toast.error("Please complete all product fields.");

      return;
    }

    // Validate price

    const productPrice = Number(data.price);

    if (
      !Number.isFinite(productPrice) ||
      productPrice <= 0
    ) {
      toast.error("Please enter a valid product price.");

      return;
    }

    // Ensure API URL is configured

    if (!url) {
      toast.error("Backend API URL is not configured.");

      return;
    }

    // ========================================
    // VERIFY ADMINISTRATOR SESSION
    // ========================================

    // Require an authenticated administrator before uploading.
    // The backend independently verifies the JWT and admin role.

    const token = localStorage.getItem("adminToken");

    if (!token) {
      toast.error(
        "Administrator session not found. Please log in again."
      );

      return;
    }

    try {
      setLoading(true);

      // ========================================
      // PREPARE PRODUCT DATA
      // ========================================

      const formData = new FormData();

      formData.append("name", data.name.trim());

      formData.append(
        "description",
        data.description.trim()
      );

      formData.append("price", data.price);

      formData.append("category", data.category);

      formData.append("image", image);

      // ========================================
      // SECURE PRODUCT UPLOAD
      // ========================================

      // Send the administrator JWT.
      // The browser handles multipart form boundaries.

      const response = await axios.post(
        `${url.replace(/\/+$/, "")}/api/product/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 90000,
        }
      );

      // ========================================
      // CHECK BACKEND RESPONSE
      // ========================================

      if (response.data?.success) {
        toast.success("Product added successfully!");

        // Clear form after successful upload

        resetForm();
      } else {
        toast.error(
          response.data?.message ||
            "Unable to add product."
        );
      }
    } catch (error) {
      console.error(
        "Product upload failed:",
        error.response?.data || error.message
      );

      // ========================================
      // AUTHENTICATION ERRORS
      // ========================================

      if (error.response?.status === 401) {
        toast.error(
          "Your administrator session has expired. Please log in again."
        );
      } else if (error.response?.status === 403) {
        toast.error(
          "Access denied. Administrator permission is required."
        );
      } else if (error.code === "ECONNABORTED") {
        toast.error(
          "The server took too long to respond. Please try again."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Product upload failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // ADD PRODUCT PAGE
  // ========================================

  return (
    <div className="add">
      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <div className="add-page-header">
        <div className="add-page-heading">
          <span className="add-eyebrow">
            PRODUCT MANAGEMENT
          </span>

          <h1>Add New Product</h1>

          <p>
            Create a new product listing for your
            Ridwan Business online store.
          </p>
        </div>

        <div className="add-page-badge">
          <span className="add-page-badge-dot" />

          <span>Product Management</span>
        </div>
      </div>

      {/* ====================================
          MAIN CONTENT GRID
      ==================================== */}

      <div className="add-layout">
        {/* ==================================
            LEFT: PRODUCT FORM
        ================================== */}

        <form
          className="add-form"
          onSubmit={onSubmitHandler}
        >
          {/* ================================
              PRODUCT INFORMATION CARD
          ================================ */}

          <section className="add-card">
            <div className="add-section-header">
              <div className="add-section-number">
                01
              </div>

              <div className="add-section-heading">
                <h2>Product Information</h2>

                <p>
                  Enter the details customers will
                  see in your store.
                </p>
              </div>
            </div>

            <div className="add-card-content">
              {/* PRODUCT NAME */}

              <div className="add-field">
                <label htmlFor="product-name">
                  Product Name
                  <span className="add-required">*</span>
                </label>

                <input
                  id="product-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Samsung Galaxy S26 Ultra"
                  value={data.name}
                  onChange={onChangeHandler}
                  maxLength={150}
                  required
                  disabled={loading}
                />

                <span className="add-field-help">
                  Enter a clear and descriptive
                  product name.
                </span>
              </div>

              {/* PRODUCT DESCRIPTION */}

              <div className="add-field">
                <label htmlFor="product-description">
                  Product Description
                  <span className="add-required">*</span>
                </label>

                <textarea
                  id="product-description"
                  name="description"
                  rows={6}
                  placeholder="Describe the product, specifications, features, and benefits..."
                  value={data.description}
                  onChange={onChangeHandler}
                  required
                  disabled={loading}
                />

                <span className="add-field-help">
                  Include useful details to help
                  customers understand the product.
                </span>
              </div>

              {/* CATEGORY AND PRICE */}

              <div className="add-fields-row">
                {/* CATEGORY */}

                <div className="add-field">
                  <label htmlFor="product-category">
                    Product Category
                    <span className="add-required">
                      *
                    </span>
                  </label>

                  <select
                    id="product-category"
                    name="category"
                    value={data.category}
                    onChange={onChangeHandler}
                    required
                    disabled={loading}
                  >
                    <option value="">
                      Select a category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.value}
                        value={category.value}
                      >
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PRICE */}

                <div className="add-field">
                  <label htmlFor="product-price">
                    Product Price
                    <span className="add-required">
                      *
                    </span>
                  </label>

                  <div className="add-price-input">
                    <span className="add-currency">
                      GH₵
                    </span>

                    <input
                      id="product-price"
                      type="number"
                      name="price"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      value={data.price}
                      onChange={onChangeHandler}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================================
              PRODUCT IMAGE CARD
          ================================ */}

          <section className="add-card">
            <div className="add-section-header">
              <div className="add-section-number">
                02
              </div>

              <div className="add-section-heading">
                <h2>Product Image</h2>

                <p>
                  Upload a clear image to showcase
                  your product.
                </p>
              </div>
            </div>

            <div className="add-card-content">
              <div className="add-field">
                <label htmlFor="product-image">
                  Main Product Image
                  <span className="add-required">
                    *
                  </span>
                </label>

                {/* IMAGE UPLOAD AREA */}

                <label
                  htmlFor="product-image"
                  className={`add-upload-zone ${
                    image ? "has-image" : ""
                  }`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Selected product preview"
                      className="add-upload-preview"
                    />
                  ) : (
                    <div className="add-upload-placeholder">
                      <div className="add-upload-icon">
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 16V4" />

                          <path d="m7 9 5-5 5 5" />

                          <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                        </svg>
                      </div>

                      <strong>
                        Click to upload product image
                      </strong>

                      <span>
                        Select an image from your computer
                      </span>

                      <small>
                        JPG, PNG, WEBP or another
                        supported image format
                      </small>
                    </div>
                  )}
                </label>

                <input
                  ref={fileInputRef}
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={imageHandler}
                  className="add-file-input"
                  disabled={loading}
                />

                {/* SELECTED IMAGE INFORMATION */}

                <div className="add-upload-info">
                  <span>
                    {image
                      ? image.name
                      : "No image selected"}
                  </span>

                  {image && (
                    <button
                      type="button"
                      className="add-change-image"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={loading}
                    >
                      Change Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ================================
              FORM ACTIONS
          ================================ */}

          <div className="add-form-actions">
            <button
              type="button"
              className="add-reset-btn"
              onClick={resetForm}
              disabled={loading}
            >
              Clear Form
            </button>

            <button
              type="submit"
              className="add-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="add-loading-spinner" />

                  <span>Publishing Product...</span>
                </>
              ) : (
                <>
                  <span>Publish Product</span>

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 12h16" />
                    <path d="m13 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ==================================
            RIGHT: LIVE PRODUCT PREVIEW
        ================================== */}

        <aside className="add-aside">
          <div className="add-preview-card">
            <div className="add-preview-header">
              <div>
                <span className="add-preview-label">
                  PRODUCT PREVIEW
                </span>

                <h3>Storefront Preview</h3>
              </div>

              <span className="add-preview-badge">
                Draft
              </span>
            </div>

            {/* IMAGE PREVIEW */}

            <div className="add-preview-image">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product preview"
                />
              ) : (
                <div className="add-preview-empty">
                  <img
                    src={assets.upload_area}
                    alt=""
                  />

                  <span>
                    Product image will appear here
                  </span>
                </div>
              )}
            </div>

            {/* PRODUCT PREVIEW INFORMATION */}

            <div className="add-preview-content">
              <span className="add-preview-category">
                {data.category || "PRODUCT CATEGORY"}
              </span>

              <h4>
                {data.name.trim() ||
                  "Your Product Name"}
              </h4>

              <p className="add-preview-description">
                {data.description.trim()
                  ? data.description.trim().slice(0, 140)
                  : "Your product description will appear here as you complete the form."}
              </p>

              <div className="add-preview-divider" />

              <div className="add-preview-price-row">
                <span>Product Price</span>

                <strong>
                  {formatPrice(data.price)}
                </strong>
              </div>
            </div>
          </div>

          {/* ==================================
              PUBLISHING TIPS
          ================================== */}

          <div className="add-tips-card">
            <div className="add-tips-icon">
              ★
            </div>

            <h3>Before You Publish</h3>

            <p>
              Use a clear product image, an accurate
              description, and the correct price.
            </p>

            <div className="add-tips-footer">
              RIDWAN BUSINESS • ADMIN
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Add;