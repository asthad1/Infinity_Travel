import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './Home.css';
import FlightSearchForm from '../components/FlightSearchForm';
import HotelSearchForm from '../components/HotelSearchForm';
import RentalSearchForm from '../components/RentalSearchForm';
import travelImage from '../assets/images/ladyonboat.jpg';
import NotificationBanner from '../components/NotificationBanner';
import Ad from '../components/Ad';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faHotel, faCrown, faCheck, faStar, faShieldAlt, faHeadset, faMoneyBillWave, faUserShield, faCar } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('flights');
  const searchFormRef = useRef(null);

  useEffect(() => {
    // If we have state from navigation and it includes activeTab
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }

    // If we should auto-scroll to search section
    const shouldScroll = location.state?.rentalSearch?.autoScroll || 
                        location.state?.hotelSearch?.autoScroll ||
                        location.state?.flightSearch?.autoScroll;

    if (shouldScroll && searchFormRef.current) {
      searchFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.state]);

  // Retrieve user information from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="home">
      {/* Notification Banner */}
      <NotificationBanner user={user} />
      <Ad /> 

      {/* Hero Section */}
      <div className="jumbotron container bg-light p-5 mt-5">  {/* Add margin-top to avoid overflow */}
        <div className="row align-items-center">
          {/* Left Column: Image */}
          <div className="col-md-6">
            <img
              src={travelImage}
              alt="Infinity Travel"
              className="img-fluid rounded"
            />
          </div>
          {/* Right Column: Text */}
          <div className="col-md-6 text-center">
            <h1 className="display-4">Welcome to Infinity Travel</h1>
            <p className="lead">
              Plan your next adventure with us and explore the world!
            </p>
            <a href="/" className="btn btn-primary btn-lg mt-3">Start Your Journey</a>
          </div>
        </div>
      </div>

      {/* Search Type Toggle */}
      <div className="container my-4">
        <div className="search-toggle-container text-center">
          <div className="btn-group" role="group" aria-label="Search type toggle">
            <button
              type="button"
              className={`btn ${activeTab === 'flights' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('flights')}
            >
              <FontAwesomeIcon icon={faPlane} className="me-2" />
              Flights
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'hotels' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('hotels')}
            >
              <FontAwesomeIcon icon={faHotel} className="me-2" />
              Hotels
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'rentals' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('rentals')}
            >
              <FontAwesomeIcon icon={faCar} className="me-2" />
              Rentals
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container my-4" ref={searchFormRef}>
        {activeTab === 'flights' && <FlightSearchForm />}
        {activeTab === 'hotels' && <HotelSearchForm />}
        {activeTab === 'rentals' && <RentalSearchForm />}
      </div>


      {/* Features Section */}
      <div className="container mt-5 features-container">
        <h2 className="text-center mb-5">
          Why Choose Infinity Travel?
          <div className="title-underline"></div>
        </h2>
        
        <div className="row features-section g-4">
          {/* Flight Features */}
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FontAwesomeIcon icon={faPlane} className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Best Flight Deals</h3>
                <p className="feature-description">
                  Save up to 40% on flights worldwide. Price match guarantee with free cancellation on most airlines.
                </p>
                <ul className="feature-highlights">
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-success" />
                    Price match guarantee
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-success" />
                    24/7 flight tracking
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-success" />
                    Flexible booking options
                  </li>
                </ul>
                <div className="feature-stats">
                  <div className="stat">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Airlines</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">1M+</span>
                    <span className="stat-label">Happy Travelers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Features */}
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon-wrapper hotel-icon">
                <FontAwesomeIcon icon={faHotel} className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Luxury Stays</h3>
                <p className="feature-description">
                  From boutique hotels to luxury resorts. Verified reviews and virtual tours for confident booking.
                </p>
                <ul className="feature-highlights">
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-success" />
                    Best price guarantee
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-success" />
                    Free cancellation
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-success" />
                    Verified reviews
                  </li>
                </ul>
                <div className="feature-stats">
                  <div className="stat">
                    <span className="stat-number">100K+</span>
                    <span className="stat-label">Properties</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">4.8/5</span>
                    <span className="stat-label">Avg. Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Features */}
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon-wrapper rewards-icon">
                <FontAwesomeIcon icon={faCrown} className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Exclusive Rewards</h3>
                <p className="feature-description">
                  Join our rewards program for instant perks. Earn points on every booking and unlock premium benefits.
                </p>
                <ul className="feature-highlights">
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-success" />
                    Member-only deals
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-success" />
                    Points never expire
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheck} className="text-success" />
                    Priority support
                  </li>
                </ul>
                <div className="feature-badge">
                  <span className="badge bg-primary">
                    <FontAwesomeIcon icon={faStar} className="me-1" />
                    Premium Benefits
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="trust-indicators mt-5">
          <div className="row text-center g-3">
            <div className="col-6 col-md-3">
              <div className="trust-item">
                <FontAwesomeIcon icon={faShieldAlt} className="trust-icon" />
                <div className="trust-text">Secure Booking</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="trust-item">
                <FontAwesomeIcon icon={faHeadset} className="trust-icon" />
                <div className="trust-text">24/7 Support</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="trust-item">
                <FontAwesomeIcon icon={faMoneyBillWave} className="trust-icon" />
                <div className="trust-text">Best Price Guarantee</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="trust-item">
                <FontAwesomeIcon icon={faUserShield} className="trust-icon" />
                <div className="trust-text">Privacy Protected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
