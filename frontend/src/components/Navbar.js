import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';  // Import styles

function Navbar({ user, setUser }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Infinity Travel
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/support">
                Support
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/flightsearches">
                Search Flights
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/my-flights">My Flights</Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text">Welcome, {user}!</span>  {/* Display user's name */}
                </li>
                <li className="nav-item">
                  <LogoutButton setUser={setUser} />  {/* Logout button when user is logged in */}
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

// Logout button component
function LogoutButton({ setUser }) {
  const handleLogout = () => {
    setUser(null);  // Reset user state
    window.location.href = '/login';  // Redirect to login after logout
  };

  return <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>;
}

export default Navbar;
