import React from 'react';

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <span className="logo-icon">🏨</span>
            <h4>Luxury Hotel</h4>
          </div>
          <p>Your trusted partner for hotel bookings and reservations. Experience luxury like never before.</p>
          <div className="social-links">
            <a href="#" className="social-link">📘</a>
            <a href="#" className="social-link">🐦</a>
            <a href="#" className="social-link">📷</a>
            <a href="#" className="social-link">💼</a>
          </div>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#rooms">Available Rooms</a></li>
            <li><a href="#features">Our Services</a></li>
            <li><a href="#testimonials">Guest Reviews</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="#help">Help Center</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <span>123 Luxury Ave, Downtown City</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>1-800-HOTEL-01</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <span>info@luxuryhotel.com</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Luxury Hotel Management System. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#cookies">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;