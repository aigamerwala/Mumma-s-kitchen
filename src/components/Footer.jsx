import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import "../styles/footer-style.css";

export const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* About Library */}
        <div className="footer-section about">
          <h2>Mumma's Kitchen</h2>
          <p>
            Where we serve delicious and healthy meals made with love. Our mission is to provide nutritious food that nourishes both body and soul. Join us for a culinary journey that celebrates the flavors of home-cooked meals.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3>🔗 Quick Links</h3>
          <ul className="ml-8 ">
            <li><a href="/Main">Home</a></li>
            <li><a href="/Profile">Order</a></li>
            <li><a href="/Books">Support</a></li>
            <li><a href="/Enquiry">Enquiry</a></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-section contact">
          <h3>📞 Contact Us</h3>
          <p>Sector 14, Faridabad, Haryana</p>
          <p>Near by market PNB bank, faridabad dental care.</p>
          <p>Phone: +91 9315293470, +91 8901988707</p>
          <p>Email: sunitadavi9315280114@gmail.com</p>
        </div>

        {/* Newsletter Subscription */}
        <div className="footer-section newsletter">
          <h3>📩 Stay Updated</h3>
          <input type="email" placeholder="Enter your email" />
          <button onClick={() => {console.log("Subscribed")}}>Subscribe</button>
        </div>
      </div>

      {/* Social Media Icons */}
      <div className="social-icons">
        <a href="#"><FaFacebook /></a>
        <a href="#"><FaTwitter /></a>
        <a href="#"><FaLinkedin /></a>
        <a href="#"><FaInstagram /></a>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© 2025 Library Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;