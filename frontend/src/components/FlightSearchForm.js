import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import './FlightSearchForm.css';
import FlightFilter from './FlightFilter';
import FlightSearchResults from './FlightSearchResults';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setFilteredFlights, setErrorMessage } from '../store/flightsSlice';
import { setDepartureAirport, setDestinationAirport, setDepartureDate, setTravelers } from '../store/searchSlice';
// import { saveSearch } from '../store/savedSearchesSlice';
import axios from 'axios';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faPlaneArrival, faCalendarAlt, faUser } from '@fortawesome/free-solid-svg-icons';

function FlightSearchForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const departureAirport = useSelector((state) => state.search.departureAirport);
  const destinationAirport = useSelector((state) => state.search.destinationAirport);
  const departureDate = useSelector((state) => state.search.departureDate);
  const travelers = useSelector((state) => state.search.travelers);
  const filteredFlights = useSelector((state) => state.flights.filteredFlights);
  const errorMessage = useSelector((state) => state.flights.errorMessage);

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [airports, setAirports] = useState([]);
  const [numStops, setNumStops] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [filteredReturnFlights, setFilteredReturnFlights] = useState([]);
  const [isRoundtrip, setIsRoundtrip] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:9001/api/airports')
      .then((response) => {
        const airportOptions = response.data.map((airport) => ({
          value: airport.code,
          label: `${airport.name} (${airport.code})`,
        }));
        setAirports(airportOptions);
      })
      .catch((error) => {
        console.error('Error fetching airports:', error);
        dispatch(setErrorMessage('Error fetching airport data. Please try again.'));
      });

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, [dispatch]);

  const handleSaveSearch = async () => {
    if (!departureAirport || !destinationAirport || !departureDate || travelers < 1) {
      dispatch(setErrorMessage('Please fill all required fields before saving the search.'));
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.user_id) {
      dispatch(setErrorMessage('Please log in to save searches'));
      return;
    }

    /// Fetch city and country details for the selected airports
    const fromDetails = await axios.get(`http://localhost:9001/api/airport-details/${departureAirport.value}`);
    const toDetails = await axios.get(`http://localhost:9001/api/airport-details/${destinationAirport.value}`);

    // Prepare search data
    const searchData = {
      user_id: user.user_id,
      from_airport: departureAirport.value,
      to_airport: destinationAirport.value,
      departure_date: departureDate,
      return_date: returnDate || null,
      adults: parseInt(travelers),
      max_stops: numStops ? parseInt(numStops) : null,
      max_price: maxPrice ? parseInt(maxPrice) : null,
      preferred_airline: selectedAirline || null,
      name: `${departureAirport.label} to ${destinationAirport.label}`,
      from_city: fromDetails.data.city,
      from_country: fromDetails.data.country,
      to_city: toDetails.data.city,
      to_country: toDetails.data.country
    };


    console.log('Sending search data:', searchData);  // Debug log

    setIsSaving(true);
    try {
      const response = await axios.post('http://localhost:9001/api/saved-searches', searchData);
      console.log('Save search response:', response.data);
      dispatch(setErrorMessage(''));
      alert('Search saved successfully!');
    } catch (error) {
      console.error('Save search error:', error.response?.data || error);
      const errorMessage = error.response?.data?.error || 'Failed to save search. Please try again.';
      dispatch(setErrorMessage(errorMessage));
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!departureAirport || !destinationAirport || !departureDate || travelers < 1) {
      dispatch(setErrorMessage('Please fill all the required fields.'));
      return;
    }

    const selectedDepartureDate = new Date(departureDate);
    const selectedReturnDate = new Date(returnDate);

    if (isRoundtrip && selectedReturnDate <= selectedDepartureDate) {
      dispatch(setErrorMessage('Return date must be after departure date.'));
      return;
    }

    const searchCriteria = {
      departureAirport: departureAirport?.value,
      destinationAirport: destinationAirport?.value,
      departureDate,
      returnDate: isRoundtrip ? returnDate : null,
      numTravellers: travelers,
      numStops,
      selectedAirline,
      maxPrice,
    };

    // Retrieve user data if available
    const user = JSON.parse(localStorage.getItem('user')) || null;

    // Capture search metrics with additional details
    const searchMetrics = {
      from_airport: departureAirport?.value,
      to_airport: destinationAirport?.value,
      departure_date: departureDate,
      return_date: isRoundtrip ? returnDate : null,
      travelers: parseInt(travelers),
      roundtrip: isRoundtrip,
      timestamp: new Date().toISOString(),
      user_id: user ? user.user_id : null,
      user_role: user ? user.role : 'guest',
      max_stops: numStops ? parseInt(numStops) : null,
      preferred_airline: selectedAirline || null,
      max_price: maxPrice ? parseFloat(maxPrice) : null,
    };

    console.log('Sending search metrics:', searchMetrics);

    // API call to save search metrics
    axios
      .post('http://localhost:9001/api/metrics', searchMetrics)
      .then(() => {
        console.log('Search metrics saved:', searchMetrics);
      })
      .catch((error) => {
        console.error('Error saving search metrics:', error.response?.data || error);
      });

    axios
      .post('http://localhost:9001/api/flights/search', searchCriteria)
      .then((response) => {
        const { departureFlights, returnFlights } = response.data;

        if (departureFlights.length === 0) {
          dispatch(setErrorMessage('No departure flights found matching the criteria.'));
        } else {
          dispatch(setErrorMessage(''));
          dispatch(setFilteredFlights(departureFlights));
        }

        if (isRoundtrip) {
          if (returnFlights.length === 0) {
            dispatch(setErrorMessage('No return flights found matching the criteria.'));
          } else {
            setFilteredReturnFlights(returnFlights);
          }
        }
      })
      .catch((error) => {
        console.error('Error searching flights:', error);
        dispatch(setErrorMessage('Error searching flights. Please try again.'));
      });
  };

  const handleThingsToDo = () => {
    if (!departureAirport) {
      dispatch(setErrorMessage('Please select a departure airport.'));
      return;
    }
    navigate('/things-to-do', { state: { departureAirport } });
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

        {/* Button Group */}
        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary btn-lg">
            Search Flights
          </button>
          <button
            type="button"
            className="btn btn-outline-primary btn-lg"
            onClick={handleSaveSearch}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Search'}
          </button>
          <button
            type="button"
            className="btn btn-outline-primary btn-lg"
            onClick={handleThingsToDo}
          >
            Things to do
          </button>
        </div>

        {/* Error Messages */}
        {errorMessage && (
          <div className="alert alert-danger mt-3" role="alert">
            {errorMessage}
          </div>
        )}
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