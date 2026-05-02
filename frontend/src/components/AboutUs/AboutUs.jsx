import React, { useEffect } from 'react';
import './AboutUs.css';

const AboutUs = () => {
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll('.about-us-content p').forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) {
          // ✅ Add reveal class with staggered delay
          setTimeout(() => {
            el.classList.add('reveal');
          }, index * 200); // 200ms delay per paragraph
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // run once on load
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="about-us">
      {/* ✅ Hero banner section */}
      <div className="about-us-hero">
        <h1>About Us</h1>
      </div>

      {/* ✅ Content section */}
      <div className="about-us-content">
        <p>
          At Ridwan's Business, we are dedicated to providing high‑quality products and 
          exceptional customer service. Our mission is to deliver innovative solutions 
          that make everyday life easier and more enjoyable.
        </p>
        <p>
          We believe in building lasting relationships with our customers through trust, 
          transparency, and reliability. Every order is handled with care, ensuring 
          satisfaction from purchase to delivery.
        </p>
        <p>
          Our team is passionate about excellence and committed to continuous improvement. 
          We strive to exceed expectations and create value for our community.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
