import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';  // Import styles

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <h1>TravelApp</h1>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/support">Customer Support</Link></li>
        {/* Add more links as needed */}
      </ul>
      <div className="user-profile">
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
