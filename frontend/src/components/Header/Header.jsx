import React from 'react';
import './Header.css';
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.div
      className="hero-banner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="hero-overlay">
        <Container>
          <motion.h1
            className="hero-title"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Welcome to <span style={{ color: "red" }}>RIDWAN'S BUSINESS</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Your One‑Stop Tech & Gadget Store — Phones, Laptops, Smartwatches & Repairs
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Button as={Link} to="/products" variant="light" size="lg">
              Shop Now
            </Button>
            <Button as={Link} to="/cart" variant="outline-light" size="lg">
              View Cart
            </Button>
          </motion.div>
        </Container>
      </div>
    </motion.div>
  );
};

export default Header;
