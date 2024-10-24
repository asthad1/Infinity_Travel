import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar({ user }) {
  const navigate = useNavigate();
  const [savedSearchCount, setSavedSearchCount] = useState(0);

  useEffect(() => {
    if (user?.user_id) {
      fetchSavedSearchCount();
    }
  }, [user?.user_id]);

  const fetchSavedSearchCount = async () => {
    try {
      const response = await axios.get(`http://localhost:9001/api/saved-searches?user_id=${user.user_id}`);
      setSavedSearchCount(response.data.length);
    } catch (error) {
      console.error('Error fetching saved search count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Infinity Travel</Link>
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
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/support">Support</Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            {user && user.email ? (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user-circle"></i> {user.email}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><Link className="dropdown-item" to="/profile">Change Password</Link></li>
                    <li><Link className="dropdown-item" to="/my-favorites">My Favorites</Link></li>
                    <li><Link className="dropdown-item" to="/my-flights">My Flights</Link></li>
                    <li>
                      <Link className="dropdown-item d-flex justify-content-between align-items-center" to="/saved-searches">
                        <span><i className="fas fa-search"></i> Saved Searches</span>
                        {savedSearchCount > 0 && (
                          <span className="badge bg-primary rounded-pill">{savedSearchCount}</span>
                        )}
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                  </ul>
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

export default Navbar;