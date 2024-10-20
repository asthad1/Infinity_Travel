import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import './FlightSearchForm.css';
import FlightFilter from './FlightFilter';
import FlightSearchResults from './FlightSearchResults'; // Import FlightSearchResults
import { useDispatch, useSelector } from 'react-redux';
import { setFilteredFlights, setErrorMessage } from '../store/flightsSlice';
import { setDepartureAirport, setDestinationAirport, setDepartureDate, setTravelers } from '../store/searchSlice';
import axios from 'axios'; // Import axios for API calls

function FlightSearchForm() {
  const dispatch = useDispatch();

  // Redux state
  const departureAirport = useSelector((state) => state.search.departureAirport);
  const destinationAirport = useSelector((state) => state.search.destinationAirport);
  const departureDate = useSelector((state) => state.search.departureDate);
  const travelers = useSelector((state) => state.search.travelers);
  const filteredFlights = useSelector((state) => state.flights.filteredFlights); // Get filtered flights

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [airports, setAirports] = useState([]); // State for storing airport options
  const [numStops, setNumStops] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch airports on component load
  useEffect(() => {
    axios
      .get('http://localhost:9001/api/airports') // Replace with the correct airport endpoint
      .then((response) => {
        const airportOptions = response.data.map((airport) => ({
          value: airport.code,
          label: `${airport.name} (${airport.code})`,
        }));
        setAirports(airportOptions); // Populate airports dynamically from API
      })
      .catch((error) => {
        console.error('Error fetching airports:', error);
        dispatch(setErrorMessage('Error fetching airport data. Please try again.'));
      });
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();

    // Check if required fields are filled
    if (!departureAirport || !destinationAirport || !departureDate || travelers < 1) {
      dispatch(setErrorMessage('Please fill all the required fields.'));
      return;
    }

    // Prepare search criteria
    const searchCriteria = {
      departureAirport: departureAirport?.value,
      destinationAirport: destinationAirport?.value,
      departureDate,
      numTravellers: travelers,
      numStops,
      selectedAirline,
      maxPrice,
    };

    // Send search request to the backend
    axios
      .post('http://localhost:9001/api/flights/search', searchCriteria) // Replace with correct search endpoint
      .then((response) => {
        const flights = response.data;
        if (flights.length === 0) {
          dispatch(setErrorMessage('No flights found matching the criteria.'));
        } else {
          dispatch(setErrorMessage('')); // Clear any error message
          dispatch(setFilteredFlights(flights)); // Update filtered flights in Redux
        }
      })
      .catch((error) => {
        console.error('Error searching flights:', error);
        dispatch(setErrorMessage('Error searching flights. Please try again.'));
      });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Search Flights</h2>
      <form onSubmit={handleSearch}>
        <div className="row g-3">
          {/* Departure Airport Field */}
          <div className="col-md-6 col-lg-3">
            <label htmlFor="departureAirport" className="form-label">
              Leaving from <span className="text-danger">*</span>
            </label>
            <Select
              options={airports}
              value={departureAirport}
              onChange={(option) => dispatch(setDepartureAirport(option))}
              placeholder="Select Departure"
              isClearable={true}
              required
            />
          </div>

          {/* Destination Airport Field */}
          <div className="col-md-6 col-lg-3">
            <label htmlFor="destinationAirport" className="form-label">
              Going to <span className="text-danger">*</span>
            </label>
            <Select
              options={airports}
              value={destinationAirport}
              onChange={(option) => dispatch(setDestinationAirport(option))}
              placeholder="Select Destination"
              isClearable={true}
              required
            />
          </div>

          {/* Departure Date Field */}
          <div className="col-md-6 col-lg-3">
            <label htmlFor="departureDate" className="form-label">
              Departure Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={departureDate}
              onChange={(e) => dispatch(setDepartureDate(e.target.value))}
              min={minDate}
              required
            />
          </div>

          {/* Travelers Field */}
          <div className="col-md-6 col-lg-2">
            <label htmlFor="travelers" className="form-label">
              Travelers <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              value={travelers}
              onChange={(e) => dispatch(setTravelers(e.target.value))}
              min="1"
              max="10"
              required
            />
          </div>

          {/* Toggle Filters Button */}
          <div className="col-md-auto d-flex align-items-end">
            <button type="button" className="btn btn-outline-primary" onClick={() => setShowFilters(!showFilters)}>
              <i className="fas fa-filter"></i> Filters
            </button>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <FlightFilter
            onFilterChange={({ numStops, airline, maxPrice }) => {
              setNumStops(numStops);
              setSelectedAirline(airline);
              setMaxPrice(maxPrice);
            }}
          />
        )}

        <button type="submit" className="btn btn-primary btn-lg mt-3">Search Flights</button>
      </form>

      {/* Display Flight Search Results */}
      {filteredFlights && filteredFlights.length > 0 ? (
        <FlightSearchResults flights={filteredFlights} />
      ) : (
        <div className="mt-3 text-muted">No flights found</div>
      )}
    </div>
  );
}

export default FlightSearchForm;
