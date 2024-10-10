import React from 'react';
import './Footer.css';  // Import styles

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="/about">About Us</a>
        <a href="/contact">Contact Us</a>
      </div>
      <div className="footer-social">
        <a href="https://facebook.com">Facebook</a>
        <a href="https://twitter.com">Twitter</a>
      </div>
    </footer>
  );
};

export default Footer;
