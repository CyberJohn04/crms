import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">CarRental</h3>
          <p className="footer-description">
            Your trusted car rental service. We provide quality vehicles at affordable prices.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Services</h4>
          <ul className="footer-links">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/my-bookings">My Bookings</Link></li>
            <li><Link to="/payments">Payments</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Contact</h4>
          <ul className="footer-contact">
            <li>📍 123 Car Street, Auto City</li>
            <li>📞 +1 (555) 123-4567</li>
            <li>✉️ support@carrental.com</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} CarRental. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

