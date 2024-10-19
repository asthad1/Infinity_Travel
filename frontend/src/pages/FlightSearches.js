import React from 'react';
import './Home.css';  // Custom CSS for styling
import FlightSearchForm from '../components/FlightSearchForm';  

function FlightSearches() {
  return (
    <div className="home">

      {/* Flight Search Section */}
      <div className="container my-5">  {/* Add margin to ensure space between sections */}
        <FlightSearchForm />
      </div>

    </div>
  );
}

export default FlightSearches;
