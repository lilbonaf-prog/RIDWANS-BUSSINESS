import { useContext, useEffect, useRef, useState } from "react";
import "./Navbar.css";

import {
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  Search,
  Cart3,
  PersonCircle,
  List,
  X,
  ChevronDown,
  BagCheck,
  BoxArrowRight,
  InfoCircle,
  ShieldLock,
} from "react-bootstrap-icons";

import { StoreContext } from "../../context/StoreContext";

// ==========================================
// RIDWAN BUSINESS
// SEARCH COMPONENT
// ==========================================

const SearchForm = ({
  initialQuery = "",
  onSearch,
  onSubmitted,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (typeof onSearch === "function") {
      onSearch(query);
    } else {
      const destination = query
        ? `/products?search=${encodeURIComponent(query)}`
        : "/products";

      navigate(destination);
    }

    onSubmitted?.();
  };

  const handleChange = (event) => {
    const value = event.target.value;

    setSearchQuery(value);

    if (typeof onSearch === "function") {
      onSearch(value);
    }
  };

  return (
    <form
      className="rb-nav-search"
      onSubmit={handleSearch}
      role="search"
    >
      <Search
        size={19}
        className="rb-nav-search-icon"
        aria-hidden="true"
      />

      <input
        type="search"
        value={searchQuery}
        onChange={handleChange}
        placeholder="Search phones, gadgets, accessories..."
        aria-label="Search products"
      />

      <button type="submit">
        <Search size={17} aria-hidden="true" />
        <span>Search</span>
      </button>
    </form>
  );
};

// ==========================================
// RIDWAN BUSINESS
// PREMIUM NAVIGATION BAR
// ==========================================

const Navigationbar = ({ setShowLogin, onSearch }) => {
  const { token, setToken, cartItems } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const accountRef = useRef(null);
  const moreRef = useRef(null);

  // ==========================================
  // CART QUANTITY
  // ==========================================

  const cartCount = Object.values(cartItems || {}).reduce(
    (total, value) => {
      const quantity = Number(value);

      return (
        total +
        (Number.isFinite(quantity) && quantity > 0
          ? quantity
          : 0)
      );
    },
    0
  );

  const displayedCartCount =
    cartCount > 99 ? "99+" : cartCount;

  // ==========================================
  // SEARCH URL
  // ==========================================

  const searchParams = new URLSearchParams(location.search);

  const initialSearchQuery =
    location.pathname === "/products"
      ? searchParams.get("search") || ""
      : "";

  // ==========================================
  // CLOSE DROPDOWNS
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }

      if (
        moreRef.current &&
        !moreRef.current.contains(event.target)
      ) {
        setMoreOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
        setMoreOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ==========================================
  // CLOSE MENUS
  // ==========================================

  const closeMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
    setMoreOpen(false);
  };

  // ==========================================
  // CUSTOMER LOGIN
  // ==========================================

  const handleLogin = () => {
    closeMenus();
    setShowLogin(true);
  };

  // ==========================================
  // CUSTOMER LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");

    setToken("");

    closeMenus();

    navigate("/");
  };

  // ==========================================
  // ACTIVE NAVIGATION
  // ==========================================

  const navLinkClass = ({ isActive }) =>
    `rb-nav-link ${isActive ? "active" : ""}`;

  return (
    <header className="rb-nav">

      {/* ======================================
          TOP INFORMATION BAR
      ====================================== */}

      <div className="rb-nav-topbar">
        <div className="rb-nav-topbar-inner">

          <span>
            Discover the Latest Smartphones, Gadgets & Accessories
          </span>

          <Link to="/about" onClick={closeMenus}>
            About Ridwan Business
          </Link>

        </div>
      </div>

      {/* ======================================
          MAIN NAVIGATION
      ====================================== */}

      <div className="rb-nav-main">
        <div className="rb-nav-main-inner">

          {/* OFFICIAL LOGO */}

          <Link
            to="/"
            className="rb-nav-brand"
            onClick={closeMenus}
            aria-label="Ridwan Business homepage"
          >
            <img
              src="/logo.png"
              alt=""
              className="rb-nav-brand-logo"
              width="58"
              height="58"
            />

            <span className="rb-nav-brand-text">
              <span>RIDWAN'S</span>
              <strong>BUSINESS</strong>
            </span>
          </Link>

          {/* ==================================
              PRODUCT SEARCH
          ================================== */}

          <SearchForm
            key={`${location.pathname}${location.search}`}
            initialQuery={initialSearchQuery}
            onSearch={onSearch}
            onSubmitted={closeMenus}
          />

          {/* ==================================
              NAVIGATION ACTIONS
          ================================== */}

          <div className="rb-nav-actions">

            {/* SHOPPING CART */}

            <Link
              to="/cart"
              className="rb-nav-action rb-nav-cart"
              onClick={closeMenus}
              aria-label={`Shopping cart, ${cartCount} items`}
            >
              <span className="rb-nav-cart-icon">

                <Cart3
                  size={23}
                  aria-hidden="true"
                />

                {cartCount > 0 && (
                  <span className="rb-nav-cart-count">
                    {displayedCartCount}
                  </span>
                )}

              </span>

              <span className="rb-nav-action-text">
                Cart
              </span>
            </Link>

            {/* ==================================
                LOGIN / ACCOUNT
            ================================== */}

            {!token ? (
              <button
                type="button"
                className="rb-nav-login-btn"
                onClick={handleLogin}
              >
                <PersonCircle size={20} />
                <span>Sign In</span>
              </button>
            ) : (
              <div
                className="rb-nav-account"
                ref={accountRef}
              >

                <button
                  type="button"
                  className="rb-nav-account-btn"
                  onClick={() =>
                    setAccountOpen((previous) => !previous)
                  }
                  aria-expanded={accountOpen}
                  aria-controls="rb-account-dropdown"
                >
                  <PersonCircle size={23} />

                  <span>Account</span>

                  <ChevronDown size={13} />
                </button>

                {accountOpen && (
                  <div
                    className="rb-nav-dropdown rb-nav-account-dropdown"
                    id="rb-account-dropdown"
                  >
                    <div className="rb-nav-dropdown-heading">
                      My Account
                    </div>

                    <Link
                      to="/myorders"
                      onClick={closeMenus}
                    >
                      <BagCheck size={17} />
                      My Orders
                    </Link>

                    <button
                      type="button"
                      onClick={logout}
                      className="rb-nav-logout"
                    >
                      <BoxArrowRight size={17} />
                      Logout
                    </button>

                  </div>
                )}

              </div>
            )}

            {/* ==================================
                MOBILE MENU
            ================================== */}

            <button
              type="button"
              className="rb-nav-mobile-toggle"
              onClick={() =>
                setMenuOpen((previous) => !previous)
              }
              aria-label={
                menuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              aria-controls="rb-nav-links"
            >
              {menuOpen ? (
                <X size={26} />
              ) : (
                <List size={27} />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* ======================================
          NAVIGATION LINKS
      ====================================== */}

      <nav
        className={`rb-nav-links ${
          menuOpen ? "is-open" : ""
        }`}
        id="rb-nav-links"
        aria-label="Main navigation"
      >
        <div className="rb-nav-links-inner">

          {/* HOME */}

          <NavLink
            to="/"
            end
            className={navLinkClass}
            onClick={closeMenus}
          >
            Home
          </NavLink>

          {/* PRODUCTS */}

          <NavLink
            to="/products"
            className={navLinkClass}
            onClick={closeMenus}
          >
            Shop Products
          </NavLink>

          {/* CART */}

          <NavLink
            to="/cart"
            className={navLinkClass}
            onClick={closeMenus}
          >
            Shopping Cart
          </NavLink>

          {/* ORDERS */}

          <NavLink
            to="/myorders"
            className={navLinkClass}
            onClick={closeMenus}
          >
            My Orders
          </NavLink>

          {/* ==================================
              MORE DROPDOWN
          ================================== */}

          <div
            className="rb-nav-more"
            ref={moreRef}
          >
            <button
              type="button"
              className={`rb-nav-link rb-nav-more-btn ${
                moreOpen ? "active" : ""
              }`}
              onClick={() =>
                setMoreOpen((previous) => !previous)
              }
              aria-expanded={moreOpen}
              aria-controls="rb-more-dropdown"
            >
              More
              <ChevronDown size={13} />
            </button>

            {moreOpen && (
              <div
                className="rb-nav-dropdown rb-nav-more-dropdown"
                id="rb-more-dropdown"
              >
                <Link
                  to="/about"
                  onClick={closeMenus}
                >
                  <InfoCircle size={17} />
                  About Us
                </Link>

                <Link
                  to="/privacy"
                  onClick={closeMenus}
                >
                  <ShieldLock size={17} />
                  Privacy Policy
                </Link>
              </div>
            )}

          </div>

        </div>
      </nav>

    </header>
  );
};

export default Navigationbar;