import React, { useEffect } from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll('.privacy-content p').forEach((el, index) => {
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
    <div className="privacy-policy">
      {/* ✅ Hero banner section */}
      <div className="privacy-hero">
        <h1>Privacy Policy</h1>
      </div>

      {/* ✅ Content section */}
      <div className="privacy-content">
        <p>
          Your privacy is important to us. This policy explains how we collect, use, 
          and protect your personal information when you interact with Ridwan's Business.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We may collect personal details such as your name, email address, phone number, 
          and delivery information when you place an order or contact us.
        </p>

        <h2>How We Use Your Information</h2>
        <p>
          The information we collect is used to process orders, provide customer support, 
          improve our services, and communicate important updates.
        </p>

        <h2>Data Protection</h2>
        <p>
          We implement appropriate security measures to protect your personal data from 
          unauthorized access, disclosure, or misuse.
        </p>

        <h2>Third‑Party Services</h2>
        <p>
          We may use trusted third‑party providers (such as payment processors) to 
          facilitate transactions. These providers are obligated to protect your data.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please reach out to us at 
          <a href="mailto:example@gmail.com"> example@gmail.com</a>.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
