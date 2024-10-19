// FlightSearchResults.js
import React from 'react';
import './FlightSearchResults.css'; // Ensure this CSS is linked
import { useDispatch, useSelector } from 'react-redux';
import { saveFlight } from '../store/flightsSlice'; // Import saveFlight action

import airFrance from '../assets/images/airlines/air-france.jpg';
import americanAirlines from '../assets/images/airlines/american-airlines.png';
import british from '../assets/images/airlines/british.png';
import cathay from '../assets/images/airlines/cathay.jpg';
import delta from '../assets/images/airlines/delta.png';
import emirates from '../assets/images/airlines/emirates.png';
import lufthansa from '../assets/images/airlines/lufthansa.png';
import qatar from '../assets/images/airlines/qatar.jpg';
import singapore from '../assets/images/airlines/singapore.png';
import united from '../assets/images/airlines/united.png';

// Define an object to store airline images by airline name
const airlineImages = {
  'Air France': airFrance,
  'American Airlines': americanAirlines,
  'British Airways': british,
  'Cathay Pacific': cathay,
  'Delta Airlines': delta,
  'Emirates': emirates,
  'Lufthansa': lufthansa,
  'Qatar Airways': qatar,
  'Singapore Airlines': singapore,
  'United Airlines': united,
};

// Functional component to render the flight search results
const FlightSearchResults = () => {
  const dispatch = useDispatch();
  const flights = useSelector((state) => state.flights.filteredFlights); // Get filtered flights from the Redux store

  // Handle empty flight results
  if (!flights || flights.length === 0) {
    return <h3>No flights found for the selected criteria</h3>;
  }

  // Find the cheapest and quickest flights to display in sort options
  const cheapestFlightPrice = Math.min(...flights.map(flight => flight.price));
  const quickestFlight = flights.reduce((prev, curr) => (prev.duration < curr.duration ? prev : curr), flights[0]);

  return (
    <div className="flight-search-results">
      {/* Sort Options Section */}
      <div className="sort-options">
        <div className="sort-option active">
          Best <strong>${flights[0]?.price} • {flights[0]?.duration}</strong>
        </div>
        <div className="sort-option">
          Cheapest <strong>${cheapestFlightPrice} • {flights[0]?.duration}</strong>
        </div>
        <div className="sort-option">
          Quickest <strong>${quickestFlight.price} • {quickestFlight.duration}</strong>
        </div>
      </div>

      {/* Render Flight Cards */}
      {flights.map((flight, index) => (
        <div className="flight-card" key={index}>
          <div className="flight-tags">
            <span className="tag best">Best</span>
            {flight.price === cheapestFlightPrice && <span className="tag cheapest">Cheapest</span>}
          </div>
          <div className="flight-details">
            <div className="airline-logo">
              <img
                src={airlineImages[flight.airline] || 'default-logo.png'}
                alt={flight.airline}
              />
            </div>
            <div className="flight-info">
              <div className="flight-time">
                {flight.departureTime} – {flight.arrivalTime}
              </div>
              <div className="flight-duration">
                {flight.stops === 0 ? 'nonstop' : `${flight.stops} stop(s)`} • {flight.duration}
              </div>
              <div className="flight-route">
                {flight.departureAirport} – {flight.destinationAirport}
              </div>
            </div>
            <div className="flight-price-section">
              <div className="price">${flight.price}</div>
              <div className="price-subtitle">
                As low as ${(flight.price / 12).toFixed(2)}/mo
              </div>
              <button
                className="view-deal-button"
                onClick={() => dispatch(saveFlight(flight))} // Dispatch saveFlight action
              >
                Save Flight
              </button>
              <button className="view-deal-button">View Deal</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightSearchResults;
