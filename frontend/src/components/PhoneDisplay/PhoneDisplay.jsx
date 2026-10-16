import { useContext } from "react";
import { useLocation } from "react-router-dom";

import "./PhoneDisplay.css";

import { StoreContext } from "../../context/StoreContext";
import PhoneItem from "../../PhoneItem/PhoneItem";

// ==========================================
// RIDWAN BUSINESS
// PRODUCT DISPLAY WITH SEARCH + CATEGORIES
// ==========================================

const PhoneDisplay = ({ category = "All" }) => {
  const { phone_list } = useContext(StoreContext);

  const location = useLocation();

  // ==========================================
  // GET PRODUCTS
  // ==========================================

  const products = Array.isArray(phone_list)
    ? phone_list
    : [];

  // ==========================================
  // GET SEARCH QUERY FROM URL
  // ==========================================

  const params = new URLSearchParams(location.search);

  const searchQuery =
    location.pathname === "/products"
      ? (params.get("search") || "").trim()
      : "";

  const normalizedSearch = searchQuery.toLowerCase();

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      category === "All" || item.category === category;

    const productName = String(
      item.name || ""
    ).toLowerCase();

    const productDescription = String(
      item.description || ""
    ).toLowerCase();

    const productCategory = String(
      item.category || ""
    ).toLowerCase();

    const matchesSearch =
      !normalizedSearch ||
      productName.includes(normalizedSearch) ||
      productDescription.includes(normalizedSearch) ||
      productCategory.includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const productCount = filteredProducts.length;

  // ==========================================
  // RENDER PRODUCTS
  // ==========================================

  return (
    <section
      className="phone-display"
      id="phone-display"
      aria-labelledby="phone-display-title"
    >

      {/* PRODUCT SECTION HEADER */}

      <div className="phone-display-header">

        <div className="phone-display-header-content">

          <span className="phone-display-label">
            RIDWAN BUSINESS COLLECTION
          </span>

          <h2 id="phone-display-title">
            {searchQuery
              ? "Search Results"
              : category === "All"
                ? "Shop Our Products"
                : `${category} Collection`}
          </h2>

          <p>
            {searchQuery
              ? `Showing products matching "${searchQuery}"`
              : "Explore our collection of smartphones, electronics, gadgets, and accessories. Find quality products that suit your lifestyle and budget."}
          </p>

        </div>

        {/* PRODUCT COUNT */}

        <div className="phone-display-count">
          {productCount}{" "}
          {productCount === 1 ? "Product" : "Products"}
        </div>

      </div>

      {/* PRODUCT GRID */}

      {filteredProducts.length > 0 ? (

        <div className="phone-display-list">

          {filteredProducts.map((item) => (

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

      ) : (

        <div className="phone-display-empty">

          <div className="phone-display-empty-icon">
            📦
          </div>

          <h3>No Products Found</h3>

          <p>
            {searchQuery
              ? `We couldn't find any products matching "${searchQuery}". Try another search.`
              : "There are currently no products available in this category."}
          </p>

        </div>

      )}

    </section>
  );
};

export default PhoneDisplay;