import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} className='Company-Logo' alt="Company Logo" />
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga minus numquam impedit minima eaque non dolorem quas suscipit? Mollitia, animi facilis! Obcaecati perspiciatis distinctio tempora aspernatur praesentium tempore soluta molestiae.</p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>BUSINESS</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Login</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+233 550 652 139</li>
            <li>example@gmail.com</li>
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