import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API call
import './FlightFilter.css'; // Import custom CSS for styling

function FlightFilter({ onFilterChange }) {
  const [numStops, setNumStops] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [airlines, setAirlines] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Fetch airlines from backend when the component loads
  useEffect(() => {
    axios
      .get('http://localhost:9001/api/airlines') // Replace with the correct API endpoint for fetching airlines
      .then((response) => {
        setAirlines(response.data); // Assume backend returns a list of airline names
      })
      .catch((error) => {
        console.error('Error fetching airlines:', error);
      });
  }, []);

  const handleFilterChange = () => {
    onFilterChange({
      numStops: numStops ? parseInt(numStops, 10) : null,
      airline: selectedAirline || null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    });
  };

  // Debounce filter updates
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(handleFilterChange, 300);
    setDebounceTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [numStops, selectedAirline, maxPrice]);

  const resetFilters = () => {
    setNumStops('');
    setSelectedAirline('');
    setMaxPrice('');
    onFilterChange({ numStops: null, airline: null, maxPrice: null });
  };

  return (
    <div className="flight-filter p-4 mb-4">
      <h3 className="mb-3">Filter Flights <i className="fas fa-filter"></i></h3>
      <div className="row g-3">
        {/* Number of Stops */}
        <div className="col-md-4">
          <label htmlFor="numStops" className="form-label">
            <i className="fas fa-stop-circle me-2"></i> Number of Stops
          </label>
          <select
            className="form-control"
            value={numStops}
            onChange={(e) => setNumStops(e.target.value)}
          >
            <option value="">Any</option>
            <option value="0">Non-stop</option>
            <option value="1">1 Stop</option>
            <option value="2">2+ Stops</option>
          </select>
        </div>

        {/* Airline */}
        <div className="col-md-4">
          <label htmlFor="airline" className="form-label"><i className="fas fa-plane-departure me-2"></i>Airline</label>
          <select
            className="form-control"
            value={selectedAirline}
            onChange={(e) => setSelectedAirline(e.target.value)}
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
          <label htmlFor="maxPrice" className="form-label"><i className="fas fa-dollar-sign me-2"></i>Max Price ($)</label>
          <input
            type="number"
            className="form-control"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
          />
        </div>
      </div>

      {/* Reset Filters Button */}
      <button className="btn btn-secondary mt-3" onClick={resetFilters}>
        <i className="fas fa-redo me-2"></i>Reset Filters
      </button>
    </div>
  );
}

export default FlightFilter;
