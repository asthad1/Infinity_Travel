import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { saveFavorite } from '../store/favoritesSlice';

const FlightSearchResults = ({ flights }) => {
  const dispatch = useDispatch();
  const user_id = useSelector((state) => state.user.user_id); // Get user_id from Redux
  const [shareModal, setShareModal] = useState(false);  // State to control modal visibility
  const [shareLink, setShareLink] = useState('');  // State to store the generated shareable link
  const [selectedFlight, setSelectedFlight] = useState(null);  // State to store the selected flight

  const handleSaveFavorite = (flight) => {
    if (!user_id) {
      alert('Please log in to save flights to favorites.');
      return;
    }

    const favoriteData = {
      flight_id: flight.flight_id,
      user_id: user_id,
      departure_airport: flight.departure_airport,
      arrival_airport: flight.destination_airport,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      price: flight.price,
      label: 'Favorite Flight',
    };

    dispatch(saveFavorite(favoriteData));
  };

  const handleShare = (flight) => {
    const uniqueURL = `http://localhost:3000/shared-flights/${flight.flight_id}`;
    setShareLink(uniqueURL);
    setSelectedFlight(flight);
    setShareModal(true);  // Show the modal when the user clicks "Share"
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  const handleClose = () => setShareModal(false);  // Close the modal

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
            <button className="btn btn-secondary" onClick={() => handleSaveFavorite(flight)}>
              Add to Favorites
            </button>

            {/* Share flight button */}
            <button className="btn btn-outline-primary ms-2" onClick={() => handleShare(flight)}>
              Share Flight
            </button>
          </div>
        </div>
      ))}

      {/* Modal for sharing */}
      <Modal show={shareModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Share Flight Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Share this flight search via the link below:</p>
          <input
            type="text"
            value={shareLink}
            readOnly
            className="form-control mb-3"
          />
          <Button variant="primary" onClick={handleCopyLink}>
            Copy Link
          </Button>
          <hr />
          <p>
            <a href={`mailto:?subject=Flight Details&body=Check out this flight: ${shareLink}`}>
              Share via Email
            </a>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FlightSearchResults;
