import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './FlightSearchForm.css';
import { airports } from '../data/airports';
import { flights } from '../data/flights';
import { useNavigate } from 'react-router-dom';

function FlightSearchForm() {
  const navigate = useNavigate();
  const [departureAirport, setDepartureAirport] = useState(null);
  const [destinationAirport, setDestinationAirport] = useState(null);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [filteredDepartureFlights, setFilteredDepartureFlights] = useState([]);
  const [filteredReturnFlights, setFilteredReturnFlights] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [minDate, setMinDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [numStops, setNumStops] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isRoundtrip, setIsRoundtrip] = useState(false);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const handleSwap = () => {
    const temp = departureAirport;
    setDepartureAirport(destinationAirport);
    setDestinationAirport(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const selectedDepartureDate = new Date(departureDate);
    const selectedReturnDate = new Date(returnDate);
    
    if (isRoundtrip && selectedReturnDate <= selectedDepartureDate) {
      setErrorMessage('Return date must be after departure date.');
      return;
    }

    const currentDate = new Date();
    const maxDate = new Date();
    maxDate.setMonth(currentDate.getMonth() + 6);

    if (selectedDepartureDate > maxDate || (isRoundtrip && selectedReturnDate > maxDate)) {
      setErrorMessage('You can only search for flights up to 6 months in advance.');
      return;
    }

    setErrorMessage('');

    // Filter departure flights
    const departureResults = flights.filter((flight) => {
      return (
        flight.departureAirport === departureAirport?.value &&
        flight.destinationAirport === destinationAirport?.value &&
        flight.departureTime.startsWith(departureDate) &&
        (!numStops || (numStops === '2' && flight.stops >= 2) || flight.stops === parseInt(numStops)) &&
        (!selectedAirline || flight.airline === selectedAirline) &&
        (!maxPrice || flight.price <= parseFloat(maxPrice)) &&
        flight.availableSeats >= travelers
      );
    });

    setFilteredDepartureFlights(departureResults);

    // Filter return flights if roundtrip is checked
    if (isRoundtrip) {
      const returnResults = flights.filter((flight) => {
        return (
          flight.departureAirport === destinationAirport?.value &&
          flight.destinationAirport === departureAirport?.value &&
          flight.departureTime.startsWith(returnDate) &&
          (!numStops || (numStops === '2' && flight.stops >= 2) || flight.stops === parseInt(numStops)) &&
          (!selectedAirline || flight.airline === selectedAirline) &&
          (!maxPrice || flight.price <= parseFloat(maxPrice)) &&
          flight.availableSeats >= travelers
        );
      });

      setFilteredReturnFlights(returnResults);
    }
  };

  const calculateTotalCostAndAirline = () => {
    const departureFlight = filteredDepartureFlights[0]; 
    const returnFlight = filteredReturnFlights[0]; 

    const totalCost = (departureFlight?.price || 0) + (returnFlight?.price || 0);
    const cheapestAirline = departureFlight?.price < returnFlight?.price 
      ? departureFlight?.airline 
      : returnFlight?.airline;

    return { totalCost, cheapestAirline };
  };

  // Calculate total cost and airline if roundtrip is selected
  const { totalCost, cheapestAirline } = isRoundtrip && filteredReturnFlights.length > 0
    ? calculateTotalCostAndAirline()
    : { totalCost: 0, cheapestAirline: '' }; // default values if no roundtrip

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Search Flights</h2>
      <form onSubmit={handleSearch}>
        <div className="row g-3">
          <div className="col-md-6 col-lg-3 position-relative">
            <label htmlFor="departureAirport" className="form-label">
              <i className="fas fa-map-marker-alt me-2"></i> Leaving from
            </label>
            <Select
              options={airports}
              value={departureAirport}
              onChange={(option) => setDepartureAirport(option)}
              placeholder="Select Departure"
              isClearable={true}
            />
          </div>

          <div className="col-md-auto d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-primary swap-button"
              onClick={handleSwap}
              style={{ height: '40px' }}
            >
              <i className="fas fa-exchange-alt"></i>
            </button>
          </div>

          <div className="col-md-6 col-lg-3 position-relative">
            <label htmlFor="destinationAirport" className="form-label">
              <i className="fas fa-map-marker-alt me-2"></i> Going to
            </label>
            <Select
              options={airports}
              value={destinationAirport}
              onChange={(option) => setDestinationAirport(option)}
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
              onChange={(e) => setDepartureDate(e.target.value)}
              min={minDate}
              required
            />
          </div>

          <div className="col-md-6 col-lg-3 d-flex align-items-center">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="roundtrip"
                checked={isRoundtrip}
                onChange={(e) => setIsRoundtrip(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="roundtrip">
                Roundtrip?
              </label>
            </div>
          </div>

          {isRoundtrip && (
            <div className="col-md-6 col-lg-3">
              <label htmlFor="returnDate" className="form-label">
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

          <div className="col-md-6 col-lg-2 d-flex align-items-end">
            <div className="w-75">
              <label htmlFor="travelers" className="form-label">
                Travelers
              </label>
              <input
                type="number"
                className="form-control travelers-input"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                min="1"
                max="10"
                required
              />
            </div>
            <button
              type="button"
              className="btn btn-outline-primary ms-3"
              onClick={() => setShowFilters((prev) => !prev)}
              style={{ height: '40px' }}
            >
              Filter <i className="fas fa-filter"></i>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="row g-3 align-items-center mt-4">
            <div className="col-sm-4 col-lg-2">
              <label htmlFor="numStops" className="form-label">
                Stops
                <i className="fa-solid fa-hand" style={{ display: 'block', marginTop: '5px' }}></i>
                <span className="optional" style={{ display: 'block', marginTop: '5px' }}>(Optional)</span>
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
                Airline <i className="fa-solid fa-plane" style={{ marginLeft: '5px', verticalAlign: 'middle' }}></i>
                <span className="optional" style={{ display: 'block', marginTop: '5px' }}>(Optional)</span>
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
                Max
                <i className="fa-solid fa-dollar-sign" style={{ display: 'block', marginTop: '5px' }}></i>
                <span className="optional" style={{ display: 'block', marginTop: '5px' }}>(Optional)</span>
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

        <div className="row mt-4">
          <div className="col text-start">
            <button type="submit" className="btn btn-primary btn-lg">
              Search Flights
            </button>
          </div>
        </div>
      </form>

      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}

      <div className="mt-5">
        {filteredDepartureFlights.length > 0 || filteredReturnFlights.length > 0 ? (
          <div>
            <h3>Available Flights:</h3>
            <ul className="list-group">
              {filteredDepartureFlights.map((flight, index) => (
                <li key={index} className="list-group-item">
                  <strong>{flight.airline}</strong> | Flight {flight.flightNumber}
                  <br />
                  Departure: {flight.departureTime} | Arrival: {flight.arrivalTime}
                  <br />
                  Duration: {flight.duration} | Price: ${flight.price}
                  <br />
                  Number of Stops: {flight.stops} | Available Seats: {flight.availableSeats}
                  <br />
                  Number of Travelers: {travelers}
                  <br />
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => navigate('/checkout', { state: { flight, travelers } })}
                  >
                    Purchase Flight
                  </button>
                </li>
              ))}

              {isRoundtrip && filteredReturnFlights.length === 0 && (
                <li className="list-group-item text-danger">
                  No roundtrip available.
                </li>
              )}

              {isRoundtrip && filteredReturnFlights.map((flight, index) => (
                <li key={index} className="list-group-item">
                  <strong>{flight.airline}</strong> | Flight {flight.flightNumber}
                  <br />
                  Departure: {flight.departureTime} | Arrival: {flight.arrivalTime}
                  <br />
                  Duration: {flight.duration} | Price: ${flight.price}
                  <br />
                  Number of Stops: {flight.stops} | Available Seats: {flight.availableSeats}
                  <br />
                  Number of Travelers: {travelers}
                  <br />
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => navigate('/checkout', { state: { flight, travelers } })}
                  >
                    Purchase Flight
                  </button>
                </li>
              ))}
            </ul>

            {isRoundtrip && filteredReturnFlights.length > 0 && (
              <div className="mt-3">
                <strong>Cheapest Cost for Roundtrip:</strong> ${totalCost * travelers}
                <br />
                <strong>Cheapest Airline:</strong> {cheapestAirline}
              </div>
            )}
          </div>
        ) : (
          <h3>No flights found for the selected criteria</h3>
        )}
      </div>
    </div>
  );
}

export default FlightSearchForm;
