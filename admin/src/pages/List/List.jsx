import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import { toast } from "react-toastify";

import "./List.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM PRODUCT MANAGEMENT
// ==========================================

const defaultCategories = [
  "Apple",
  "Samsung",
  "Tecno",
  "Infinix",
  "Itel",
  "Redmi",
  "Accessories",
];

// ==========================================
// ICONS
// ==========================================

const Icon = ({ name, size = 19 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...props}>
          <path d="M20 7v5h-5" />
          <path d="M4 17v-5h5" />
          <path d="M5.5 9a7 7 0 0 1 12-3l2.5 6" />
          <path d="M18.5 15a7 7 0 0 1-12 3L4 12" />
        </svg>
      );

    case "edit":
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4 10.5-10.5Z" />
        </svg>
      );

    case "delete":
      return (
        <svg {...props}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M6 6l1 15h10l1-15" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );

    case "close":
      return (
        <svg {...props}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );

    case "box":
      return (
        <svg {...props}>
          <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" />
          <path d="m3 7 9 4 9-4" />
          <path d="M12 11v10" />
        </svg>
      );

    case "category":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "check":
      return (
        <svg {...props}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "image":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// PRICE FORMATTER
// ==========================================

const formatPrice = (price) => {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "GH₵0.00";
  }

  return `GH₵${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const List = ({ url }) => {
  // Product data

  const [list, setList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Search and filters

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // Editing

  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
  });

  const [editImage, setEditImage] = useState(null);

  const [editImagePreview, setEditImagePreview] =
    useState("");

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const editFileInputRef = useRef(null);

  const editCloseButtonRef = useRef(null);

  // Backend URL

  const API_URL = (url || "").replace(/\/+$/, "");

  // ========================================
  // FETCH PRODUCTS
  // ========================================

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");

    if (!API_URL) {
      setError("Backend API URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/product/list`,
        {
          timeout: 90000,
        }
      );

      if (
        response.data?.success &&
        Array.isArray(response.data.data)
      ) {
        setList(response.data.data);
      } else {
        throw new Error(
          response.data?.message ||
            "Unable to load products."
        );
      }
    } catch (err) {
      console.error(
        "Failed to fetch products:",
        err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // ========================================
  // LOAD PRODUCTS ON PAGE OPEN
  // ========================================

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ========================================
  // AVAILABLE CATEGORIES
  // ========================================

  const categoryOptions = useMemo(() => {
    const existingCategories = list
      .map((item) => item.category)
      .filter(Boolean);

    return Array.from(
      new Set([
        ...defaultCategories,
        ...existingCategories,
      ])
    );
  }, [list]);

  // ========================================
  // FILTER PRODUCTS
  // ========================================

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return list.filter((item) => {
      const productName = String(
        item.name || ""
      ).toLowerCase();

      const productCategory = String(
        item.category || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        productName.includes(query) ||
        productCategory.includes(query);

      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [list, searchTerm, selectedCategory]);

  // ========================================
  // INVENTORY STATISTICS
  // ========================================

  const totalProducts = list.length;

  const totalCategories = new Set(
    list.map((item) => item.category).filter(Boolean)
  ).size;

  const visibleProducts = filteredProducts.length;

  // ========================================
  // EDIT IMAGE PREVIEW
  // ========================================

  useEffect(() => {
    if (!editImage) {
      setEditImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(editImage);

    setEditImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [editImage]);

  // ========================================
  // START EDITING PRODUCT
  // ========================================

  const startEdit = (item) => {
    setEditingItem(item);

    setFormData({
      name: item.name || "",
      category: item.category || "",
      price: String(item.price ?? ""),
    });

    setEditImage(null);
  };

  // ========================================
  // CLOSE EDIT FORM
  // ========================================

  const closeEdit = () => {
    if (saving) return;

    setEditingItem(null);
    setEditImage(null);
    setEditImagePreview("");
  };

  // ========================================
  // FOCUS EDIT DIALOG
  // ========================================

  useEffect(() => {
    if (!editingItem) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    editCloseButtonRef.current?.focus();

    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) {
        setEditingItem(null);
        setEditImage(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [editingItem, saving]);

  // ========================================
  // HANDLE EDIT INPUTS
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // HANDLE NEW IMAGE SELECTION
  // ========================================

  const handleEditImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");

      event.target.value = "";

      return;
    }

    setEditImage(file);
  };

  // ========================================
  // SAVE PRODUCT UPDATE
  // ========================================

  const saveUpdate = async (event) => {
    event.preventDefault();

    if (!editingItem || saving) return;

    if (
      !formData.name.trim() ||
      !formData.category.trim()
    ) {
      toast.error("Please complete all fields.");
      return;
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    // Product updates require the existing admin login token.
    const token = localStorage.getItem("adminToken");

    if (!token) {
      toast.error(
        "Administrator session not found. Please log in again."
      );
      return;
    }

    if (!API_URL) {
      toast.error("Backend API URL is not configured.");
      return;
    }

    try {
      setSaving(true);

      const form = new FormData();

      form.append("name", formData.name.trim());

      form.append(
        "category",
        formData.category.trim()
      );

      form.append("price", String(price));

      // Replace image only when a new one is selected

      if (editImage) {
        form.append("image", editImage);
      }

      const response = await axios.put(
        `${API_URL}/api/product/update/${encodeURIComponent(
          editingItem._id
        )}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 90000,
        }
      );

      if (response.data?.success) {
        toast.success("Product updated successfully!");

        setEditingItem(null);
        setEditImage(null);

        // Reload latest product information

        await fetchList();
      } else {
        toast.error(
          response.data?.message ||
            "Unable to update product."
        );
      }
    } catch (err) {
      console.error(
        "Product update failed:",
        err.message
      );

      if (err.response?.status === 401) {
        toast.error(
          "Your administrator session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        toast.error(
          "Access denied. Administrator permission is required."
        );
      } else if (err.code === "ECONNABORTED") {
        toast.error(
          "The server took too long to respond. Please try again."
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            "Unable to update product."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // DELETE PRODUCT
  // ========================================

  const removeProduct = async (item) => {
    if (deletingId || saving) return;

    // Product removal requires an authenticated administrator.
    const token = localStorage.getItem("adminToken");

    if (!token) {
      toast.error(
        "Administrator session not found. Please log in again."
      );
      return;
    }

    if (!API_URL) {
      toast.error("Backend API URL is not configured.");
      return;
    }

    // Avoid accidental removal of live products

    const confirmed = window.confirm(
      `Are you sure you want to permanently remove "${item.name}"?\n\nThis may also remove it from your live website.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);

      const response = await axios.post(
        `${API_URL}/api/product/remove`,
        {
          id: item._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 90000,
        }
      );

      if (response.data?.success) {
        toast.success(
          response.data.message ||
            "Product removed successfully!"
        );

        setList((previous) =>
          previous.filter(
            (product) => product._id !== item._id
          )
        );
      } else {
        toast.error(
          response.data?.message ||
            "Unable to remove product."
        );
      }
    } catch (err) {
      console.error(
        "Product removal failed:",
        err.message
      );

      if (err.response?.status === 401) {
        toast.error(
          "Your administrator session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        toast.error(
          "Access denied. Administrator permission is required."
        );
      } else if (err.code === "ECONNABORTED") {
        toast.error(
          "The server took too long to respond. Please try again."
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            "Unable to remove product."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // MAIN PRODUCT MANAGEMENT INTERFACE
  // ========================================

  return (
    <div className="product-list-page">

      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <div className="list-page-header">
        <div className="list-page-heading">
          <span className="list-eyebrow">
            INVENTORY MANAGEMENT
          </span>

          <h1>Manage Products</h1>

          <p>
            View, organize, edit, and manage products
            in your Ridwan Business store.
          </p>
        </div>

        <button
          type="button"
          className="list-refresh-btn"
          onClick={fetchList}
          disabled={loading}
        >
          <Icon name="refresh" />

          <span>
            {loading ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      {/* ====================================
          INVENTORY STATISTICS
      ==================================== */}

      <div className="list-stats-grid">

        <div className="list-stat-card">
          <div className="list-stat-icon red">
            <Icon name="box" size={23} />
          </div>

          <div>
            <span>Total Products</span>

            <strong>{totalProducts}</strong>

            <p>Products in your inventory</p>
          </div>
        </div>

        <div className="list-stat-card">
          <div className="list-stat-icon gold">
            <Icon name="category" size={23} />
          </div>

          <div>
            <span>Product Categories</span>

            <strong>{totalCategories}</strong>

            <p>Categories currently in use</p>
          </div>
        </div>

        <div className="list-stat-card">
          <div className="list-stat-icon green">
            <Icon name="check" size={23} />
          </div>

          <div>
            <span>Showing Products</span>

            <strong>{visibleProducts}</strong>

            <p>Matching your current filters</p>
          </div>
        </div>

      </div>

      {/* ====================================
          PRODUCT MANAGEMENT CARD
      ==================================== */}

      <section className="list-management-card">

        {/* CARD HEADER */}

        <div className="list-management-header">
          <div>
            <span className="list-section-label">
              PRODUCT INVENTORY
            </span>

            <h2>All Products</h2>

            <p>
              Search your catalog or update
              existing products.
            </p>
          </div>

          <span className="list-count-badge">
            {totalProducts} Products
          </span>
        </div>

        {/* ==================================
            SEARCH AND FILTER
        ================================== */}

        <div className="list-toolbar">

          {/* SEARCH */}

          <div className="list-search-wrapper">
            <Icon name="search" size={20} />

            <input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search products"
            />
          </div>

          {/* CATEGORY FILTER */}

          <div className="list-filter-wrapper">
            <label htmlFor="list-category-filter">
              Category
            </label>

            <select
              id="list-category-filter"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
            >
              <option value="All">
                All Categories
              </option>

              {categoryOptions.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* ==================================
            LOADING STATE
        ================================== */}

        {loading ? (
          <div
            className="list-state"
            role="status"
          >
            <div className="list-loading-spinner" />

            <h3>Loading Products</h3>

            <p>
              Retrieving your inventory...
            </p>
          </div>
        ) : error ? (
          /* ================================
              ERROR STATE
          ================================ */

          <div className="list-state list-error-state">
            <Icon name="box" size={36} />

            <h3>Unable to Load Products</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={fetchList}
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* ================================
              EMPTY STATE
          ================================ */

          <div className="list-state list-empty-state">
            <div className="list-empty-icon">
              <Icon name="box" size={35} />
            </div>

            <h3>
              {list.length === 0
                ? "No Products Yet"
                : "No Matching Products"}
            </h3>

            <p>
              {list.length === 0
                ? "Your product inventory is currently empty."
                : "Try changing your search or category filter."}
            </p>

            {list.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* ================================
              PRODUCT TABLE
          ================================ */

          <div className="list-table-wrapper">
            <table className="list-product-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((item) => (
                  <tr key={item._id}>

                    {/* PRODUCT IMAGE AND NAME */}

                    <td data-label="Product">
                      <div className="list-product-cell">

                        <div className="list-product-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                            />
                          ) : (
                            <Icon
                              name="image"
                              size={25}
                            />
                          )}
                        </div>

                        <div className="list-product-details">
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            Ridwan Business
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* CATEGORY */}

                    <td data-label="Category">
                      <span className="list-category-badge">
                        {item.category || "Uncategorized"}
                      </span>
                    </td>

                    {/* PRICE */}

                    <td data-label="Price">
                      <strong className="list-price">
                        {formatPrice(item.price)}
                      </strong>
                    </td>

                    {/* ACTION BUTTONS */}

                    <td data-label="Actions">
                      <div className="list-actions">

                        <button
                          type="button"
                          className="list-edit-btn"
                          onClick={() => startEdit(item)}
                          disabled={Boolean(deletingId || saving)}
                        >
                          <Icon
                            name="edit"
                            size={16}
                          />

                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="list-delete-btn"
                          onClick={() =>
                            removeProduct(item)
                          }
                          disabled={Boolean(deletingId || saving)}
                        >
                          <Icon
                            name="delete"
                            size={16}
                          />

                          <span>
                            {deletingId === item._id
                              ? "Removing..."
                              : "Remove"}
                          </span>
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* ==================================
            TABLE FOOTER
        ================================== */}

        {!loading && !error && (
          <div className="list-table-footer">
            <p>
              Showing{" "}
              <strong>{visibleProducts}</strong>
              {" "}of{" "}
              <strong>{totalProducts}</strong>
              {" "}products
            </p>

            <span>
              RIDWAN BUSINESS INVENTORY
            </span>
          </div>
        )}

      </section>

      {/* ====================================
          EDIT PRODUCT MODAL
      ==================================== */}

      {editingItem && (
        <div
          className="list-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEdit();
            }
          }}
        >
          <section
            className="list-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="list-edit-title"
          >

            {/* MODAL HEADER */}

            <div className="list-modal-header">
              <div>
                <span className="list-section-label">
                  PRODUCT MANAGEMENT
                </span>

                <h2 id="list-edit-title">
                  Edit Product
                </h2>

                <p>
                  Update the selected product's details.
                </p>
              </div>

              <button
                ref={editCloseButtonRef}
                type="button"
                className="list-modal-close"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Close edit form"
              >
                <Icon name="close" size={21} />
              </button>
            </div>

            {/* MODAL FORM */}

            <form
              className="list-edit-form"
              onSubmit={saveUpdate}
            >

              {/* IMAGE */}

              <div className="list-edit-image-area">

                <div className="list-edit-image-preview">
                  {editImagePreview || editingItem.image ? (
                    <img
                      src={
                        editImagePreview ||
                        editingItem.image
                      }
                      alt="Product"
                    />
                  ) : (
                    <Icon name="image" size={40} />
                  )}
                </div>

                <div className="list-edit-image-info">
                  <strong>Product Image</strong>

                  <p>
                    Select a new image only if you
                    want to replace the current one.
                  </p>

                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditImage}
                    disabled={saving}
                    aria-label="Choose replacement product image"
                  />
                </div>

              </div>

              {/* PRODUCT NAME */}

              <div className="list-edit-field">
                <label htmlFor="edit-product-name">
                  Product Name
                </label>

                <input
                  id="edit-product-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>

              {/* CATEGORY */}

              <div className="list-edit-field">
                <label htmlFor="edit-product-category">
                  Product Category
                </label>

                <select
                  id="edit-product-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={saving}
                >
                  <option value="">
                    Select Category
                  </option>

                  {categoryOptions.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRICE */}

              <div className="list-edit-field">
                <label htmlFor="edit-product-price">
                  Product Price (GH₵)
                </label>

                <input
                  id="edit-product-price"
                  type="number"
                  name="price"
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </div>

              {/* ACTIONS */}

              <div className="list-modal-actions">
                <button
                  type="button"
                  className="list-cancel-btn"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="list-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    "Saving Changes..."
                  ) : (
                    <>
                      <Icon name="check" size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

            </form>

          </section>
        </div>
      )}

    </div>
  );
};

export default List;