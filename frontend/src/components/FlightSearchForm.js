import React, { useState } from 'react';
import Select from 'react-select';
import './FlightSearchForm.css';
import { airports } from '../data/airports';
import { flights } from '../data/flights';  // Import flight database

function FlightSearchForm() {
  const [departureAirport, setDepartureAirport] = useState(null);
  const [destinationAirport, setDestinationAirport] = useState(null);
  const [departureDate, setDepartureDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [filteredFlights, setFilteredFlights] = useState([]); // To store filtered flights
  const [errorMessage, setErrorMessage] = useState(''); // To store error message

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Get the current date and the date 6 months from now
    const currentDate = new Date();
    const maxDate = new Date();
    maxDate.setMonth(currentDate.getMonth() + 6);  // Add 6 months to the current date

    // Convert the departureDate to a Date object
    const selectedDepartureDate = new Date(departureDate);

    // Validate if the selected date is within the next 6 months
    if (selectedDepartureDate > maxDate) {
      setErrorMessage('You can only search for flights up to 6 months in advance.');
      return;
    }

    // If date is valid, proceed with the search
    setErrorMessage('');  // Clear any existing error message

    // Filter flights based on search parameters
    const results = flights.filter(flight => {
      return (
        flight.departureAirport === departureAirport.value &&
        flight.destinationAirport === destinationAirport.value &&
        flight.departureTime.startsWith(departureDate)  // Matches date
      );
    });

    setFilteredFlights(results); // Set the filtered flights
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Search Flights</h2>
      <form onSubmit={handleSearch}>
        <div className="row g-3 align-items-center">
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

          <div className="col-md-1 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100">
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Display error message */}
      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}

      {/* Display filtered flights */}
      <div className="mt-5">
        {filteredFlights.length > 0 ? (
          <div>
            <h3>Available Flights:</h3>
            <ul className="list-group">
              {filteredFlights.map((flight, index) => (
                <li key={index} className="list-group-item">
                  <strong>{flight.airline}</strong> | Flight {flight.flightNumber}
                  <br />
                  Departure: {flight.departureTime} | Arrival: {flight.arrivalTime}
                  <br />
                  Duration: {flight.duration} | Price: ${flight.price}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <h3>No flights found for the selected criteria</h3>
        )}
      </div>
    </div>
  );
}

export default FlightSearchForm;
