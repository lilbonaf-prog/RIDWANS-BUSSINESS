import React from 'react'
import './Header.css'
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.div className="hero-banner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        backgroundImage: "url('/images/hero-banner.jpg')", // updated image
        backgroundSize: "cover",      // ensues full coverage
        backgroundPosition: "center", // keeps the focus centered
        backgroundRepeat: "no-repeat",
        color: "white",
        minHeight: "70vh",            // ensures enough height
        display: "flex",
        alignItems: "center",         // vertically center content
        textAlign: "center",
        padding: "0 20px",            // horizontal padding for small screens
      }}
    >
      <Container>
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            textShadow: "2px 2px 8px rgba(0,0,0,0.6)", // improves readability
            fontSize: "2.5rem",
            fontWeight: "700"
          }}
        >
          Welcome to <span style={{ color: "red" }}>RIDWAN'S BUSINESS</span>

        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            textShadow: "1px 1px 6px rgba(0,0,0,0.5)",
            fontSize: "1.2rem",
            marginBottom: "30px"
          }}
        >
          <span style={{color:'whitesmoke'}}>Your One-Stop Tech & Gadget Store — Phones, Laptops, Smartwatches & Repairs</span> 
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}
        >
          <Button as={Link} to="/products" variant="light" size="lg">
            Shop Now
          </Button>
          <Button as={Link} to="/cart" variant="outline-light" size="lg">
            View Cart
          </Button>
        </motion.div>
      </Container>
    </motion.div>
  )
}

export default Header