import React from 'react';
import './Home.css';  // Custom CSS for styling
import FlightSearchForm from '../components/FlightSearchForm';  
import travelImage from '../assets/images/ladyonboat.jpg';  // Import image

function Home() {
  return (
    <div className="home">
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
          <div className="col-md-6 text-center text-md-start">
            <h1 className="display-4">Welcome to Infinity Travel</h1>
            <p className="lead">
              Plan your next adventure with us and explore the world!
            </p>
            <a href="/" className="btn btn-primary btn-lg mt-3">Start Your Journey</a>
          </div>
        </div>
      </div>

      {/* Flight Search Section */}
      <div className="container my-5">  {/* Add margin to ensure space between sections */}
        <FlightSearchForm />
      </div>

      {/* Features Section */}
      <div className="container mt-5">
        <div className="row features-section">
          <div className="col-md-4 mb-4 d-flex align-items-stretch">
            <div className="card text-center feature-card">
              <div className="card-body">
                <i className="fas fa-plane fa-3x mb-3"></i>
                <h5 className="card-title">Best Prices on Flights</h5>
                <p className="card-text">Find the cheapest flights to your dream destination.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4 d-flex align-items-stretch">
            <div className="card text-center feature-card">
              <div className="card-body">
                <i className="fas fa-hotel fa-3x mb-3"></i>
                <h5 className="card-title">Plan Your Trip</h5>
                <p className="card-text">Book hotels, flights, and activities with ease.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4 d-flex align-items-stretch">
            <div className="card text-center feature-card">
              <div className="card-body">
                <i className="fas fa-tags fa-3x mb-3"></i>
                <h5 className="card-title">Exclusive Deals</h5>
                <p className="card-text">Get access to exclusive discounts and offers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;