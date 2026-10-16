import "./Header.css";

import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  motion as Motion,
  useReducedMotion,
} from "framer-motion";

import { ArrowRight } from "react-bootstrap-icons";

// ==========================================
// RIDWAN BUSINESS - PREMIUM HERO BANNER
// ==========================================

const Header = () => {
  // Respect users who prefer reduced animations
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="rb-hero"
      aria-labelledby="rb-hero-title"
    >
      <Container className="rb-hero-container">

        {/* ==================================
            HERO CONTENT
        ================================== */}

        <Motion.div
          className="rb-hero-content"
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 30,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: "easeOut",
          }}
        >

          {/* ==================================
              SMALL BRAND LABEL
          ================================== */}

          <div className="rb-hero-badge">

            <span
              className="rb-hero-badge-dot"
              aria-hidden="true"
            ></span>

            WELCOME TO RIDWAN BUSINESS

          </div>

          {/* ==================================
              MAIN HERO HEADING
          ================================== */}

          <h1
            id="rb-hero-title"
            className="rb-hero-title"
          >
            Discover the
            <br />

            <span>
              Future of Tech.
            </span>
          </h1>

          {/* ==================================
              HERO DESCRIPTION
          ================================== */}

          <p className="rb-hero-description">
            Upgrade your everyday life with smartphones,
            laptops, smartwatches, and premium accessories.
            {" "}
            Discover technology that fits your lifestyle
            at Ridwan Business.
          </p>

          {/* ==================================
              SHOPPING BUTTONS
          ================================== */}

          <div className="rb-hero-buttons">

            {/* SHOP NOW BUTTON */}

            <Link
              to="/products"
              className="rb-hero-btn-primary"
            >
              <span>Shop Now</span>

              <ArrowRight
                size={19}
                aria-hidden="true"
              />
            </Link>

            {/* VIEW CART BUTTON */}

            <Link
              to="/cart"
              className="rb-hero-btn-secondary"
            >
              View Cart
            </Link>

          </div>

          {/* ==================================
              PRODUCT CATEGORIES
          ================================== */}

          <div className="rb-hero-categories">

            <span>Smartphones</span>

            <span
              className="rb-hero-dot"
              aria-hidden="true"
            >
              •
            </span>

            <span>Laptops</span>

            <span
              className="rb-hero-dot"
              aria-hidden="true"
            >
              •
            </span>

            <span>Accessories</span>

          </div>

        </Motion.div>

      </Container>

      {/* ==================================
          DECORATIVE BOTTOM LINE
      ================================== */}

      <div
        className="rb-hero-bottom-line"
        aria-hidden="true"
      ></div>

    </section>
  );
};

export default Header;