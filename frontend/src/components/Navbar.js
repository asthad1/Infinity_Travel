// Navbar.js

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearUser } from '../store/userSlice';
import { setTravelCredit } from '../store/travelCreditSlice';
import { resetNotificationCount } from '../store/notificationSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faTrophy, faWallet } from '@fortawesome/free-solid-svg-icons';
import { useFlightContext } from '../context/FlightContext';
import axios from 'axios';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Retrieve user from Redux store
  const user = useSelector((state) => state.user);
  const notificationCount = useSelector((state) => state.notification.count);
  const travelCredit = useSelector((state) => state.travelCredit.balance);
  const { totalFlightPrice } = useFlightContext();

  // Fetch travel credit and update Redux state
  useEffect(() => {
    const fetchTravelCredit = async () => {
      try {
        if (user?.user_id) {
          const response = await axios.get(`http://localhost:9001/api/travel_credits/${user.user_id}`);
          dispatch(setTravelCredit(response.data.balance));
        }
      } catch (error) {
        console.error('Error fetching travel credit:', error);
      }
    };

    fetchTravelCredit();
  }, [user, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch(clearUser());
    dispatch(setTravelCredit(0));
    dispatch(resetNotificationCount()); // Reset notification count
    navigate('/login');
    window.location.reload();
  };

  const handleMyFlightsClick = () => {
    dispatch(resetNotificationCount()); // Reset notification count
  };

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
          {/* Left side navigation */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            {user?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/coupons">
                    Coupons
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/metrics">
                    Metrics
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/support">
                Support
              </Link>
            </li>
          </ul>
          {/* Right side navigation */}
          <ul className="navbar-nav ms-auto">
            {user && user.email ? (
              <>
                <li className="nav-item">
                  <div className="reward-points nav-link">
                    <FontAwesomeIcon icon={faTrophy} className="me-1" />
                    <span>Reward Points: {totalFlightPrice}</span>
                  </div>
                </li>
                <li className="nav-item">
                  <div className="travel-credit nav-link">
                    <FontAwesomeIcon icon={faWallet} className="me-1" style={{ color: 'green' }} />
                    <span>Travel Credit: ${travelCredit.toFixed(2)}</span>
                  </div>
                </li>
                {/* User Dropdown */}
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
                    <li><Link className="dropdown-item" to="/my-favorites">My Favorites</Link></li>
                    <li><Link className="dropdown-item" to="/my-hotels">My Hotels</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/my-rentals">
                        My Rentals
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/my-bookings">
                        My Bookings
                      </Link>
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
                      <Link className="dropdown-item" to="/saved-searches">
                        Individual Flights
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                {/* Login/Register links */}
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
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
