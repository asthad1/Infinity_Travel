import React, { useState } from 'react';
import Select from 'react-select'; // Use react-select for IntelliSense
import { airports } from '../data/airports';  // Import airport options

function FlightSearchForm() {
  const [departureAirport, setDepartureAirport] = useState(null);
  const [destinationAirport, setDestinationAirport] = useState(null);
  const [departureDate, setDepartureDate] = useState('');
  const [travelers, setTravelers] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log({
      departureAirport,
      destinationAirport,
      departureDate,
      travelers,
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Search Flights</h2>
      <form onSubmit={handleSearch}>
        <div className="row g-3 align-items-center">
          {/* Departure Airport */}
          <div className="col-md-3">
            <label htmlFor="departureAirport" className="form-label">
              Departure Airport
            </label>
            <Select
              options={airports}
              value={departureAirport}
              onChange={(option) => setDepartureAirport(option)}
              placeholder="Select Departure"
              isClearable={true}
            />
          </div>

          {/* Destination Airport */}
          <div className="col-md-3">
            <label htmlFor="destinationAirport" className="form-label">
              Destination Airport
            </label>
            <Select
              options={airports}
              value={destinationAirport}
              onChange={(option) => setDestinationAirport(option)}
              placeholder="Select Destination"
              isClearable={true}
            />
          </div>

          {/* Departure Date */}
          <div className="col-md-3">
            <label htmlFor="departureDate" className="form-label">
              Departure Date
            </label>
            <input
              type="date"
              className="form-control"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
            />
          </div>

          {/* Number of Travelers */}
          <div className="col-md-2">
            <label htmlFor="travelers" className="form-label">
              Travelers
            </label>
            <input
              type="number"
              className="form-control"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              min="1"
              max="10"
              required
            />
          </div>

          {/* Search Button */}
          <div className="col-md-1 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FlightSearchForm;
