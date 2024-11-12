import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { useFlightContext } from '../context/FlightContext';
import './Navbar.css';

function Navbar({ user }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notificationCount, setNotificationCount] = useState(0);
  const { totalFlightPrice } = useFlightContext();

  useEffect(() => {
    const count = localStorage.getItem('notificationCount') || 0;
    setNotificationCount(Number(count));
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('notificationCount');
    dispatch(setUser(null));
    navigate('/login');
    window.location.reload();
  };

  const handleMyFlightsClick = () => {
    localStorage.setItem('notificationCount', 0);
    setNotificationCount(0);
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
            {user?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/coupons">Coupons</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/metrics">Metrics</Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/support">Support</Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            {user && user.email ? (
              <>
                <li className="nav-item">
                  <div className="reward-points nav-link">
                    <FontAwesomeIcon icon={faTrophy} className="me-1" />
                    <span>Reward Points: {totalFlightPrice}</span>
                  </div>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FontAwesomeIcon icon={faUserCircle} className="me-1" />
                    {user.email}
                    {notificationCount > 0 && (
                      <span className="notification-badge">{notificationCount}</span>
                    )}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><Link className="dropdown-item" to="/profile">Change Password</Link></li>
                    <li><Link className="dropdown-item" to="/addemails">Add Emails</Link></li>
                    <li><Link className="dropdown-item" to="/my-favorites">My Favorites</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/my-rentals">My Rentals</Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/my-bookings">My Bookings</Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item d-flex justify-content-between align-items-center"
                        to="/my-flights"
                        onClick={handleMyFlightsClick}
                      >
                        <span>My Flights</span>
                        {notificationCount > 0 && (
                          <span className="notification-badge">{notificationCount}</span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/saved-searches">Individual Flights</Link>
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