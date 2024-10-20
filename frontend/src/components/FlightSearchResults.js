import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveFavorite } from '../store/favoritesSlice';

const FlightSearchResults = ({ flights }) => {
  const dispatch = useDispatch();
  const user_id = useSelector((state) => state.user.user_id); // Get user_id from Redux

  // Log the flights data to verify it
  console.log('Received flight data:', flights);

  const handleSaveFavorite = (flight) => {
    if (!user_id) {
      alert('Please log in to save flights to favorites.');
      return;
    }

    // Log flight_id to confirm it's passed correctly
    console.log('Saving flight to favorites. Flight ID:', flight.id);

    const favoriteData = {
      flight_id: flight.flight_id,  // Ensure flight ID is passed here
      user_id: user_id,  // Logged-in user ID from Redux
      departure_airport: flight.departure_airport,
      arrival_airport: flight.destination_airport,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      price: flight.price,
      label: 'Favorite Flight',  // Custom label
    };

    // Dispatch the action to save the favorite
    dispatch(saveFavorite(favoriteData));
  };

  return (
    <div className="flight-search-results mt-5">
      <h3>Search Results</h3>
      {flights.map((flight, index) => (
        <div key={index} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Flight: {flight.flight_number || 'N/A'}</h5>
            <p className="card-text">Airline: {flight.airline}</p>
            <p className="card-text">
              Departure: {flight.departure_airport} at {new Date(flight.departure_time).toLocaleString()}
            </p>
            <p className="card-text">
              Arrival: {flight.destination_airport} at {new Date(flight.arrival_time).toLocaleString()}
            </p>
            <p className="card-text">Price: ${flight.price}</p>
            <p className="card-text">Stops: {flight.stops === 0 ? 'Non-stop' : flight.stops}</p>

            {/* Log flight.id here to verify */}
            <p>Flight ID: {flight.id ? flight.id : 'No Flight ID'}</p>

            <button className="btn btn-primary" onClick={() => handleBookNow(flight)}>
              Book Now
            </button>

            <button className="btn btn-secondary ms-2" onClick={() => handleSaveFlight(flight)}>
              Save Flight
            </button>

            <button className="btn btn-outline-danger ms-2" onClick={() => handleSaveFavorite(flight)}>
              <i className="fas fa-heart"></i> Add to Favorites
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightSearchResults;
