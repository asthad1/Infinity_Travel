import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import './FlightSearchForm.css';
import FlightFilter from './FlightFilter';
import FlightSearchResults from './FlightSearchResults'; // Import FlightSearchResults
import { useDispatch, useSelector } from 'react-redux';
import { setFilteredFlights, setErrorMessage } from '../store/flightsSlice';
import { setDepartureAirport, setDestinationAirport, setDepartureDate, setTravelers } from '../store/searchSlice';
import axios from 'axios'; // Import axios for API calls
import { Form } from 'react-bootstrap'; // Import for slider
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faPlaneArrival, faCalendarAlt, faUser } from '@fortawesome/free-solid-svg-icons';

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
  const [returnDate, setReturnDate] = useState('');
  const [filteredReturnFlights, setFilteredReturnFlights] = useState([]);
  const [isRoundtrip, setIsRoundtrip] = useState(false);

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

    // Set min date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();

    // Check if required fields are filled
    if (!departureAirport || !destinationAirport || !departureDate || travelers < 1) {
      dispatch(setErrorMessage('Please fill all the required fields.'));
      return;
    }

    const selectedDepartureDate = new Date(departureDate);
    const selectedReturnDate = new Date(returnDate);

    // Check if return date is after the departure date for roundtrip
    if (isRoundtrip && selectedReturnDate <= selectedDepartureDate) {
      dispatch(setErrorMessage('Return date must be after departure date.'));
      return;
    }

    // Prepare search criteria
    const searchCriteria = {
      departureAirport: departureAirport?.value,
      destinationAirport: destinationAirport?.value,
      departureDate,
      returnDate: isRoundtrip ? returnDate : null, // Include return date if roundtrip is selected
      numTravellers: travelers,
      numStops,
      selectedAirline,
      maxPrice,
    };

    // Send search request to the backend
    axios
      .post('http://localhost:9001/api/flights/search', searchCriteria)
      .then((response) => {
        const { departureFlights, returnFlights } = response.data;

        if (departureFlights.length === 0) {
          dispatch(setErrorMessage('No departure flights found matching the criteria.'));
        } else {
          dispatch(setErrorMessage('')); // Clear any error message
          dispatch(setFilteredFlights(departureFlights)); // Update filtered flights in Redux
        }

        // Filter return flights if roundtrip is checked
        if (isRoundtrip) {
          if (returnFlights.length === 0) {
            dispatch(setErrorMessage('No return flights found matching the criteria.'));
          } else {
            setFilteredReturnFlights(returnFlights); // Set return flights in local state
          }
        }
      })
      .catch((error) => {
        console.error('Error searching flights:', error);
        dispatch(setErrorMessage('Error searching flights. Please try again.'));
      });
  };

  return (
    <div className="container mt-5 p-4 border rounded shadow-sm">
      <h2 className="mb-4 text-center">Search Flights</h2>
      <form onSubmit={handleSearch} className="p-3">
        <div className="row g-3">
          {/* Departure Airport Field */}
          <div className="col-md-6 col-lg-3">
            <label htmlFor="departureAirport" className="form-label">
              <FontAwesomeIcon icon={faPlaneDeparture} className="me-2" />
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
              <FontAwesomeIcon icon={faPlaneArrival} className="me-2" />
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
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
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

          {/* Roundtrip Toggle */}
          <div className="col-md-6 col-lg-3 d-flex align-items-center justify-content-center">
            <label className="form-check-label me-2" htmlFor="roundtrip">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Roundtrip
            </label>
            <Form.Check 
              type="switch" 
              id="roundtrip-switch" 
              checked={isRoundtrip} 
              onChange={(e) => setIsRoundtrip(e.target.checked)} 
            />
          </div>

          {isRoundtrip && (
            <div className="col-md-6 col-lg-3">
              <label htmlFor="returnDate" className="form-label">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Return Date
              </label>
              <input
                type="date"
                className="form-control"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={minDate}
                required={isRoundtrip}
              />
            </div>
          )}

          {/* Travelers Field */}
          <div className="col-md-6 col-lg-2">
            <label htmlFor="travelers" className="form-label">
              <FontAwesomeIcon icon={faUser} className="me-2" />
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
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowFilters(!showFilters)}
            >
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

        <button type="submit" className="btn btn-primary btn-lg mt-3">
          Search Flights
        </button>
      </form>

      {/* Display Flight Search Results */}
      {filteredFlights && filteredFlights.length > 0 && (
        <>
          <h3>Available Departure Flights:</h3>
          <FlightSearchResults flights={filteredFlights} travelers={travelers} />
        </>
      )}

      {isRoundtrip && filteredReturnFlights.length > 0 && (
        <>
          <h3>Available Return Flights:</h3>
          <FlightSearchResults flights={filteredReturnFlights} travelers={travelers} />
        </>
      )}

      {!filteredFlights.length && !filteredReturnFlights.length && (
        <div className="mt-3 text-muted">No flights found</div>
      )}
    </div>
  );
}

export default FlightSearchForm;
