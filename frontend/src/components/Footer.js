import React from 'react';
import './Footer.css';  // Import styles

function Footer() {
  return (
    <footer className="bg-dark text-light text-center p-4 mt-auto">
      <div className="container">
        <p>Follow us on social media</p>
        <a href="https://facebook.com" className="text-light mx-2">
          <i className="fab fa-facebook fa-lg"></i>
        </a>
        <a href="https://twitter.com" className="text-light mx-2">
          <i className="fab fa-twitter fa-lg"></i>
        </a>
        <a href="https://instagram.com" className="text-light mx-2">
          <i className="fab fa-instagram fa-lg"></i>
        </a>
      </div>
      <div className="container mt-3">
        <p>&copy; 2024 Infinity Travel. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
