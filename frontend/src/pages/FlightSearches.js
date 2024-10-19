import React from 'react';
import './Home.css'; // Custom CSS for styling
import FlightSearchForm from '../components/FlightSearchForm';
import { useDispatch } from 'react-redux';
import { saveFlight } from '../store/flightsSlice';

function FlightSearches() {
  const dispatch = useDispatch();

  const handleSaveFlight = (flight) => {
    dispatch(saveFlight(flight));
  };

  return (
    <div className="home">
      {/* Flight Search Section */}
      <div className="container my-5">
        <FlightSearchForm onSaveFlight={handleSaveFlight} /> {/* Pass handleSaveFlight correctly */}
      </div>
    </div>
  );
}

export default FlightSearches;
