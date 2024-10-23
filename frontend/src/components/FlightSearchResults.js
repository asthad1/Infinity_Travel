import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { saveFavorite } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaHeart, FaShareAlt } from 'react-icons/fa'; // Icons added for a modern look

const FlightSearchResults = ({ flights, travelers }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user_id = useSelector((state) => state.user.user_id); // Get user_id from Redux
  const [labelModal, setLabelModal] = useState(false);  // State to control label modal visibility
  const [label, setLabel] = useState('');  // State to store the label entered by the user
  const [selectedFlight, setSelectedFlight] = useState(null);  // State to store the selected flight
  const [shareModal, setShareModal] = useState(false);  // State to control share modal visibility
  const [shareLink, setShareLink] = useState('');  // State to store the generated share link

  // Function to handle "Save to Favorites" button click
  const handleSaveFavoriteClick = (flight) => {
    if (!user_id) {
      alert('Please log in to save flights to favorites.');
      return;
    }
    setSelectedFlight(flight);  // Set the selected flight
    setLabelModal(true);  // Show the label modal
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
    setLabelModal(false);  // Close the modal
    setLabel('');  // Clear the label
  };

  // Function to handle sharing the flight
  const handleShare = (flight) => {
    const uniqueURL = `http://localhost:3000/shared-flights/${flight.flight_id}`;  // Generate a shareable link
    setShareLink(uniqueURL);
    setSelectedFlight(flight);
    setShareModal(true);  // Show the share modal
  };

  // Function to handle closing the share modal
  const handleShareModalClose = () => {
    setShareModal(false);
    setShareLink('');
  };

  // Function to copy the share link to the clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  // Function to handle closing the label modal
  const handleLabelModalClose = () => {
    setLabelModal(false);
    setLabel('');
  };

  const handleCheckoutClick = (flight) => {
    if (!user_id) {  // Check if user is logged in
      alert('Please log in to purchase a flight.');
      navigate('/login');  // Redirect to login page if not logged in
      return;
    }
    navigate('/checkout', { state: { flight, travelers } });  // Proceed to checkout if logged in
  };

  return (
    <div className="flight-search-results mt-5">
      <h3>Search Results <FaPlane /></h3>
      {flights.map((flight, index) => (
        <div key={index} className="card mb-3 shadow-lg" style={{ borderRadius: '10px' }}>
          <div className="card-body">
            <h5 className="card-title">Flight: {flight.flight_number || 'N/A'}</h5>
            <p className="card-text"><strong>Airline:</strong> {flight.airline}</p>
            <p className="card-text">
              <strong>Departure:</strong> {flight.departure_airport} at {new Date(flight.departure_time).toLocaleString()}
            </p>
            <p className="card-text">
              <strong>Arrival:</strong> {flight.destination_airport} at {new Date(flight.arrival_time).toLocaleString()}
            </p>
            <p className="card-text"><strong>Price:</strong> ${flight.price}</p>

            <button
              className="btn btn-primary me-2"
              onClick={() => handleCheckoutClick(flight)}
            >
              Purchase Flight
            </button> &nbsp;
            {/* Save flight button */}
            <button className="btn btn-secondary" onClick={() => handleSaveFavoriteClick(flight)}>
              <FaHeart /> Add to Favorites
            </button>

            {/* Share flight button */}
            <button className="btn btn-outline-primary ms-2" onClick={() => handleShare(flight)}>
              <FaShareAlt /> Share Flight
            </button>
          </div>
        </div>
      ))}

      {/* Modal for entering the label before saving to favorites */}
      <Modal show={labelModal} onHide={handleLabelModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Label for Favorite</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please enter a label for this flight:</p>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="form-control"
            placeholder="Enter a custom label"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLabelModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveFavorite}>
            Save to Favorites
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for sharing the flight */}
      <Modal show={shareModal} onHide={handleShareModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Share Flight</Modal.Title>
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
          <Button variant="secondary" onClick={handleShareModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FlightSearchResults;
