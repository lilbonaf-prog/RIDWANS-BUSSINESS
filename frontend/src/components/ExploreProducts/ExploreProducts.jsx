import "./ExploreProducts.css";
import { Products_list } from "../../assets/assets";

const ExploreProducts = ({ category = "All", setCategory }) => {
  const categories = Array.isArray(Products_list)
    ? Products_list
    : [];

  // Handle category selection
  const handleCategoryChange = (selectedCategory) => {
    setCategory((previousCategory) =>
      previousCategory === selectedCategory
        ? "All"
        : selectedCategory
    );
  };

  return (
    <section
      className="rb-categories"
      id="Explore-products"
      aria-label="Explore product categories"
    >
      {/* SECTION HEADING */}
      <div className="rb-categories-heading">
        <div>
          <span className="rb-categories-label">
            SHOP BY CATEGORY
          </span>

          <h3>Find What You Love</h3>

          <p>
            Browse our collection and discover products
            that match your lifestyle.
          </p>
        </div>
      </div>

      {/* CATEGORY LIST */}
      <div
        className="rb-categories-list"
        role="group"
        aria-label="Filter products by category"
      >
        {/* ALL PRODUCTS */}
        <button
          type="button"
          className={`rb-category-card ${
            category === "All" ? "active" : ""
          }`}
          onClick={() => setCategory("All")}
          aria-pressed={category === "All"}
        >
          <div className="rb-category-image-wrapper">
            <div className="rb-category-all-icon">
              ALL
            </div>
          </div>

          <span className="rb-category-name">
            All Products
          </span>
        </button>

        {/* DYNAMIC CATEGORIES */}
        {categories.map((item) => {
          const isActive = category === item.menu_name;

          return (
            <button
              type="button"
              key={item.menu_name}
              className={`rb-category-card ${
                isActive ? "active" : ""
              }`}
              onClick={() =>
                handleCategoryChange(item.menu_name)
              }
              aria-pressed={isActive}
            >
              <div className="rb-category-image-wrapper">
                <img
                  src={item.menu_image}
                  alt=""
                  className="rb-category-image"
                  loading="lazy"
                />
              </div>

              <span className="rb-category-name">
                {item.menu_name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ExploreProducts;