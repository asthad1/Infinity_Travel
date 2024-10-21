import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { saveFavorite } from '../store/favoritesSlice';

const FlightSearchResults = ({ flights }) => {
  const dispatch = useDispatch();
  const user_id = useSelector((state) => state.user.user_id);  // Get user_id from Redux
  const [saveModal, setSaveModal] = useState(false);  // State to control save modal visibility
  const [label, setLabel] = useState('');  // State to store the label entered by the user
  const [selectedFlight, setSelectedFlight] = useState(null);  // State to store the selected flight

  // Function to handle "Save to Favorites" button click
  const handleSaveFavoriteClick = (flight) => {
    if (!user_id) {
      alert('Please log in to save flights to favorites.');
      return;
    }
    setSelectedFlight(flight);  // Set the selected flight
    setSaveModal(true);  // Show the save modal
  };

  // Function to save the flight with a custom label
  const handleSaveFavorite = () => {
    const favoriteData = {
      flight_id: selectedFlight.flight_id,
      user_id: user_id,
      departure_airport: selectedFlight.departure_airport,
      arrival_airport: selectedFlight.destination_airport,
      departure_time: selectedFlight.departure_time,
      arrival_time: selectedFlight.arrival_time,
      price: selectedFlight.price,
      label: label || 'Favorite Flight',  // Use custom label or default label if empty
    };

    dispatch(saveFavorite(favoriteData));
    setSaveModal(false);  // Close the modal
    setLabel('');  // Clear the label
  };

  // Function to handle closing the save modal
  const handleSaveModalClose = () => {
    setSaveModal(false);
    setLabel('');
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

            {/* Save flight button */}
            <button className="btn btn-secondary" onClick={() => handleSaveFavoriteClick(flight)}>
              Add to Favorites
            </button>

            {/* Share flight button */}
            <button className="btn btn-outline-primary ms-2" onClick={() => handleShare(flight)}>
              Share Flight
            </button>
          </div>
        </div>
      ))}

      {/* Modal for saving the flight with a custom label */}
      <Modal show={saveModal} onHide={handleSaveModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Save Flight to Favorites</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter a label for this flight:</p>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="form-control"
            placeholder="Enter a custom label"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSaveModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveFavorite}>
            Save to Favorites
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FlightSearchResults;
