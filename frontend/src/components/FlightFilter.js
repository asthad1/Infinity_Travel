import React, { useState } from 'react';
import './FlightFilter.css'; // Import custom CSS for styling

function FlightFilter({ airlines, onFilterChange }) {
  const [numStops, setNumStops] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleFilterChange = () => {
    onFilterChange({
      numStops: numStops ? parseInt(numStops, 10) : null,
      airline: selectedAirline || null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    });
  };

  return (
    <div className="flight-filter p-4 mb-4">
      <h3>Filter Flights</h3>
      <div className="row g-3">
        {/* Number of Stops */}
        <div className="col-md-4">
          <label htmlFor="numStops" className="form-label">
            Number of Stops
          </label>
          <select
            className="form-control"
            value={numStops}
            onChange={(e) => { setNumStops(e.target.value); handleFilterChange(); }}
          >
            <option value="">Any</option>
            <option value="0">Non-stop</option>
            <option value="1">1 Stop</option>
            <option value="2">2+ Stops</option>
          </select>
        </div>

        {/* Airline */}
        <div className="col-md-4">
          <label htmlFor="airline" className="form-label">
            Airline
          </label>
          <select
            className="form-control"
            value={selectedAirline}
            onChange={(e) => { setSelectedAirline(e.target.value); handleFilterChange(); }}
          >
            <option value="">Any</option>
            {airlines.map((airline) => (
              <option key={airline} value={airline}>
                {airline}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price */}
        <div className="col-md-4">
          <label htmlFor="maxPrice" className="form-label">
            Max Price ($)
          </label>
          <input
            type="number"
            className="form-control"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); handleFilterChange(); }}
            min="0"
          />
        </div>
      </div>
    </div>
  );
}

export default FlightFilter;
