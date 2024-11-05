import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { saveFavorite } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaHeart, FaShareAlt, FaClock, FaExchangeAlt } from 'react-icons/fa';
import './FlightSearchResults.css';

// Import airline images
const airlineImages = {
  'Air France': require('../assets/images/airlines/air-france.jpg'),
  'American Airlines': require('../assets/images/airlines/american-airlines.png'),
  'British Airways': require('../assets/images/airlines/british.png'),
  'Cathay Pacific': require('../assets/images/airlines/cathay.jpg'),
  'Delta': require('../assets/images/airlines/delta.png'),
  'Emirates': require('../assets/images/airlines/emirates.png'),
  'Lufthansa': require('../assets/images/airlines/lufthansa.png'),
  'Qatar Airways': require('../assets/images/airlines/qatar.jpg'),
  'Singapore Airlines': require('../assets/images/airlines/singapore.png'),
  'United': require('../assets/images/airlines/united.png'),
  'default': require('../assets/images/airlines/default-logo.png')
};

const FlightSearchResults = ({ flights, travelers }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user_id = useSelector((state) => state.user.user_id);
  const [labelModal, setLabelModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [label, setLabel] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [shareLink, setShareLink] = useState('');

  const getAirlineLogo = (airline) => {
    return airlineImages[airline] || airlineImages.default;
  };

  const formatDuration = (duration) => {
    return duration.replace(':', 'h ') + 'm';
  };

  // Handle "Save to Favorites" button click
  const handleSaveFavoriteClick = (flight) => {
    if (!user_id) {
      alert('Please log in to save flights to favorites.');
      navigate('/login');
      return;
    }
    setSelectedFlight(flight);
    setLabelModal(true);
  };

  // Handle saving the favorite with label
  const handleSaveFavorite = () => {
    if (!selectedFlight) return;
  
    const favoriteData = {
      flight_id: selectedFlight.flight_id,
      user_id: user_id,
      departure_airport: selectedFlight.departure_airport,
      arrival_airport: selectedFlight.destination_airport,
      departure_time: selectedFlight.departure_time,
      arrival_time: selectedFlight.arrival_time,
      price: selectedFlight.price,
      label: label || 'Favorite Flight',
      from_country: selectedFlight.from_country,  // Add country of origin
      to_country: selectedFlight.to_country,      // Add destination country
      from_city: selectedFlight.from_city,        // Add origin city
      to_city: selectedFlight.to_city             // Add destination city
    };
    console.log("Favorite data being saved:", favoriteData);
    dispatch(saveFavorite(favoriteData));
    handleLabelModalClose();
  };  

  // Handle closing the label modal
  const handleLabelModalClose = () => {
    setLabelModal(false);
    setLabel('');
    setSelectedFlight(null);
  };

  // Handle sharing the flight
  const handleShare = (flight) => {
    setSelectedFlight(flight);
    const uniqueURL = `http://localhost:3000/shared-flights/${flight.flight_id}`;
    setShareLink(uniqueURL);
    setShareModal(true);
  };

  // Handle closing the share modal
  const handleShareModalClose = () => {
    setShareModal(false);
    setShareLink('');
    setSelectedFlight(null);
  };

  // Handle copying the share link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  // Handle checkout/purchase click
  const handleCheckoutClick = (flight) => {
    if (!user_id) {
      alert('Please log in to purchase a flight.');
      navigate('/login');
      return;
    }
    navigate('/checkout', { state: { flight, travelers } });
  };

  return (
    <div className="flight-search-results">
      <h3><FaPlane /> Available Flights</h3>
      {flights.map((flight, index) => (
        <div key={index} className="flight-card">
          <div className="flight-card-header">
            <div className="airline-info">
              <img 
                src={getAirlineLogo(flight.airline)} 
                alt={flight.airline} 
                className="airline-logo"
              />
              <span>{flight.airline} - Flight {flight.flight_number}</span>
            </div>
          </div>

          <div className="flight-main-content">
            <div className="departure-info">
              <div className="flight-time">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="flight-location">{flight.departure_airport}</div>
              <div className="flight-date">{new Date(flight.departure_time).toLocaleDateString()}</div>
            </div>

            <div className="flight-duration">
              <div><FaClock /> {formatDuration(flight.duration)}</div>
              <div className="duration-line"></div>
              <div>{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</div>
            </div>

            <div className="arrival-info">
              <div className="flight-time">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="flight-location">{flight.destination_airport}</div>
              <div className="flight-date">{new Date(flight.arrival_time).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="flight-actions">
            <div className="price-section">
              <div className="price-amount">${flight.price}</div>
              <div className="price-traveler">per traveler</div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => handleCheckoutClick(flight)}
              >
                Purchase Flight
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => handleSaveFavoriteClick(flight)}
              >
                <FaHeart /> Save
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => handleShare(flight)}
              >
                <FaShareAlt /> Share
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Label Modal */}
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
            Save Your Search
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Share Modal */}
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