import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import './FlightSearchForm.css';
import FlightSearchResults from './FlightSearchResults';
import { airports } from '../data/airports';
import { useDispatch, useSelector } from 'react-redux';
import { setFilteredFlights, setErrorMessage } from '../store/flightsSlice';
import { setDepartureAirport, setDestinationAirport, setDepartureDate, setTravelers } from '../store/searchSlice';

function FlightSearchForm() {
  const dispatch = useDispatch();
  
  // State from Redux
  const departureAirport = useSelector((state) => state.search.departureAirport);
  const destinationAirport = useSelector((state) => state.search.destinationAirport);
  const departureDate = useSelector((state) => state.search.departureDate);
  const travelers = useSelector((state) => state.search.travelers);
  const filteredFlights = useSelector((state) => state.flights.filteredFlights);
  const errorMessage = useSelector((state) => state.flights.errorMessage);
  const flights = useSelector((state) => state.flights.flights); // Assuming `flights` is stored in Redux

  const [showFilters, setShowFilters] = useState(false);
  const [minDate, setMinDate] = useState(''); // To store today's date as minDate

  // Use effect to set today's date in yyyy-mm-dd format
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Additional filter states
  const [numStops, setNumStops] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Function to swap departure and destination
  const handleSwap = () => {
    dispatch(setDepartureAirport(destinationAirport));
    dispatch(setDestinationAirport(departureAirport));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Ensure flights is defined
    if (!flights) {
      dispatch(setErrorMessage('Flights data is not available.'));
      return;
    }

    // Validate if the selected date is within the next 6 months
    const currentDate = new Date();
    const maxDate = new Date();
    maxDate.setMonth(currentDate.getMonth() + 6); // Add 6 months to the current date
    const selectedDepartureDate = new Date(departureDate);

    if (selectedDepartureDate > maxDate) {
      dispatch(setErrorMessage('You can only search for flights up to 6 months in advance.'));
      return;
    }

    // If date is valid, proceed with the search
    dispatch(setErrorMessage('')); // Clear any existing error message

    // Filter flights based on search parameters and additional filters
    const results = flights.filter((flight) => {
      return (
        flight.departureAirport === departureAirport?.value &&
        flight.destinationAirport === destinationAirport?.value &&
        flight.departureTime.startsWith(departureDate) && // Matches date
        (!numStops || (numStops === '2' && flight.stops >= 2) || flight.stops === parseInt(numStops)) &&
        (!selectedAirline || flight.airline === selectedAirline) &&
        (!maxPrice || flight.price <= parseFloat(maxPrice)) &&
        flight.availableSeats >= travelers // Check if there are enough available seats
      );
    });

    dispatch(setFilteredFlights(results)); // Set the filtered flights in Redux
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Search Flights</h2>
      <form onSubmit={handleSearch}>
        {/* Search Parameters */}
        <div className="row g-3">
          <div className="col-md-6 col-lg-3 position-relative">
            <label htmlFor="departureAirport" className="form-label">
              <i className="fas fa-map-marker-alt me-2"></i> Leaving from
            </label>
            <Select
              options={airports}
              value={departureAirport}
              onChange={(option) => dispatch(setDepartureAirport(option))}
              placeholder="Select Departure"
              isClearable={true}
            />
          </div>

          {/* Swap Button */}
          <div className="col-md-auto d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-primary swap-button"
              onClick={handleSwap}
              style={{ height: '40px' }} // Adjust the height to match the input fields
            >
              <i className="fas fa-exchange-alt"></i> {/* Swap arrows icon */}
            </button>
          </div>

          <div className="col-md-6 col-lg-3 position-relative">
            <label htmlFor="destinationAirport" className="form-label">
              <i className="fas fa-map-marker-alt me-2"></i> Going to
            </label>
            <Select
              options={airports}
              value={destinationAirport}
              onChange={(option) => dispatch(setDestinationAirport(option))}
              placeholder="Select Destination"
              isClearable={true}
            />
          </div>

          <div className="col-md-6 col-lg-3">
            <label htmlFor="departureDate" className="form-label">
              Departure Date
            </label>
            <input
              type="date"
              className="form-control"
              value={departureDate}
              onChange={(e) => dispatch(setDepartureDate(e.target.value))}
              min={minDate} // Set the minimum date to today's date
              required
            />
          </div>

          <div className="col-md-6 col-lg-2 d-flex align-items-end">
            <div className="w-75">
              <label htmlFor="travelers" className="form-label">
                Travelers
              </label>
              <input
                type="number"
                className="form-control travelers-input"
                value={travelers}
                onChange={(e) => dispatch(setTravelers(e.target.value))}
                min="1"
                max="10"
                required
              />
            </div>
            <button
              type="button"
              className="btn btn-outline-primary ms-3"
              onClick={() => setShowFilters((prev) => !prev)}
              style={{ height: '40px' }} // Adjust the height to match the input field
            >
              <i className="fas fa-filter"></i> {/* Filter icon */}
            </button>
          </div>
        </div>

        {/* Additional Filters Section */}
        {showFilters && (
          <div className="row g-3 align-items-center mt-4">
            <div className="col-sm-4 col-lg-2">
              <label htmlFor="numStops" className="form-label">
                Stops <span className="optional">(Optional)</span>
              </label>
              <select
                className="form-control filter-input"
                value={numStops}
                onChange={(e) => setNumStops(e.target.value)}
              >
                <option value="">Any</option>
                <option value="0">Non-stop</option>
                <option value="1">1 Stop</option>
                <option value="2">2+ Stops</option>
              </select>
            </div>

            <div className="col-sm-4 col-lg-2">
              <label htmlFor="airline" className="form-label">
                Airline <span className="optional">(Optional)</span>
              </label>
              <select
                className="form-control filter-input"
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
              >
                <option value="">Any</option>
                {[...new Set(flights.map((flight) => flight.airline))].map((airline) => (
                  <option key={airline} value={airline}>
                    {airline}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-4 col-lg-2">
              <label htmlFor="maxPrice" className="form-label">
                Max ($) <span className="optional">(Optional)</span>
              </label>
              <input
                type="number"
                className="form-control filter-input"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="row mt-4">
          <div className="col text-start">
            <button id="SearchFlightsButton" type="submit" className="btn btn-primary btn-lg">
              Search Flights
            </button>
          </div>
        </div>
      </form>

      {/* Display error message */}
      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}

      {/* Display filtered flights */}
      <FlightSearchResults flights={filteredFlights} />
    </div>
  );
}

export default FlightSearchForm;
