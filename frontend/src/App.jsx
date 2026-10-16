import { useState } from "react";
import { Route, Routes } from "react-router-dom";

// ==========================================
// RIDWAN BUSINESS
// MAIN APPLICATION ROUTES
// ==========================================

// Components
import Navigationbar from "./components/navbar/Navbar";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";

// Pages
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import PaymentSuccess from "./pages/PaymentSuccess/PaymentSuccess";
import MyOrders from "./pages/MyOrders/MyOrders";
import ProductDetail from "./pages/ProductDetail/ProductDetail";

// Product components
import PhoneDisplay from "./components/PhoneDisplay/PhoneDisplay";

// Information pages
import AboutUs from "./components/AboutUs/AboutUs";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy";

// ==========================================
// MAIN APP COMPONENT
// ==========================================

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* ====================================
          LOGIN POPUP
      ==================================== */}

      {showLogin && (
        <LoginPopup
          setShowLogin={setShowLogin}
        />
      )}

      {/* ====================================
          APPLICATION CONTENT
      ==================================== */}

      <div className="app">

        {/* NAVIGATION BAR */}

        <Navigationbar
          setShowLogin={setShowLogin}
        />

        {/* ==================================
            WEBSITE ROUTES
        ================================== */}

        <Routes>

          {/* HOME */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* PRODUCTS */}

          <Route
            path="/products"
            element={
              <PhoneDisplay category="All" />
            }
          />

          {/* PRODUCT DETAILS */}

          <Route
            path="/product/:id"
            element={<ProductDetail />}
          />

          {/* SHOPPING CART */}

          <Route
            path="/cart"
            element={<Cart />}
          />

          {/* CHECKOUT */}

          <Route
            path="/order"
            element={<PlaceOrder />}
          />

          {/* PAYSTACK PAYMENT VERIFICATION */}

          <Route
            path="/payment-success"
            element={<PaymentSuccess />}
          />

          {/* CUSTOMER ORDERS */}

          <Route
            path="/myorders"
            element={<MyOrders />}
          />

          {/* ABOUT US */}

          <Route
            path="/about"
            element={<AboutUs />}
          />

          {/* PRIVACY POLICY */}

          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />

        </Routes>

      </div>

      {/* ====================================
          FOOTER
      ==================================== */}

      <Footer />
    </>
  );
};

export default App;