import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        {/* Left section */}
        <div className="footer-content-left">
          <img src={assets.logo} className='Company-Logo' alt="Company Logo" />
          <p>
            We are committed to delivering quality products and exceptional service. 
            Our mission is to provide innovative solutions that meet customer needs 
            while building lasting relationships based on trust and reliability. 
            Every order is handled with care, ensuring satisfaction from purchase to delivery.
          </p>
          <div className="footer-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <img src={assets.twitter_icon} alt="Twitter" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <img src={assets.linkedin_icon} alt="LinkedIn" />
            </a>
          </div>
        </div>

        {/* Center section */}
        <div className="footer-content-center">
          <h2>BUSINESS</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/privacy">Privacy policy</Link></li>
          </ul>
        </div>

        {/* Right section */}
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li><a href="tel:+233550652139">+233 550 652 139</a></li>
            <li><a href="mailto:example@gmail.com">example@gmail.com</a></li>
          </ul>
        </div>
      </div>

      <hr />
      <p className="footer-copyright">
        © {currentYear} RIDWAN'S BUSINESS. All rights reserved.
      </p>
    </div>
  )
}

export default Footer
