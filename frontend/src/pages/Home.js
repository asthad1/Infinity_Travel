import React from 'react';
import './Home.css';  // Import styles

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <div className="jumbotron text-center bg-light p-5">
        <h1 className="display-4">Welcome to Infinity Travel</h1>
        <p className="lead">
          Plan your next adventure with us and explore the world!
        </p>
        <a href="#search" className="btn btn-primary btn-lg">
          <i className="fas fa-search"></i> Start Your Journey
        </a>
      </div>

      {/* Features Section */}
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-plane fa-3x mb-3"></i>
                <h5 className="card-title">Best Prices on Flights</h5>
                <p className="card-text">
                  Find the cheapest flights to your dream destination.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-hotel fa-3x mb-3"></i>
                <h5 className="card-title">Plan Your Trip</h5>
                <p className="card-text">
                  Book hotels, flights, and activities with ease.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-tags fa-3x mb-3"></i>
                <h5 className="card-title">Exclusive Deals</h5>
                <p className="card-text">
                  Get access to exclusive discounts and offers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
