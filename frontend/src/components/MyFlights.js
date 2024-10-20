// MyFlights.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Button, Card, Row, Col } from 'react-bootstrap';
import './MyFlights.css';

import airFrance from '../assets/images/airlines/air-france.jpg';
import americanAirlines from '../assets/images/airlines/american-airlines.png';
import british from '../assets/images/airlines/british.png';
import cathay from '../assets/images/airlines/cathay.jpg';
import delta from '../assets/images/airlines/delta.png';
import emirates from '../assets/images/airlines/emirates.png';
import lufthansa from '../assets/images/airlines/lufthansa.png';
import qatar from '../assets/images/airlines/qatar.jpg';
import singapore from '../assets/images/airlines/singapore.png';
import united from '../assets/images/airlines/united.png';
import defaultLogo from '../assets/images/airlines/default-logo.png';


const BASE_URL = "https://infinity-travel.com"

// Define an object to store airline images by airline name
const airlineImages = {
  'Air France': airFrance,
  'American Airlines': americanAirlines,
  'British Airways': british,
  'Cathay Pacific': cathay,
  'Delta Airlines': delta,
  'Emirates': emirates,
  'Lufthansa': lufthansa,
  'Qatar Airways': qatar,
  'Singapore Airlines': singapore,
  'United Airlines': united,
};

function MyFlights() {
  const savedFlights = useSelector((state) => state.flights.savedFlights);
  const [shareModal, setShareModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [shareLink, setShareLink] = useState('');

  const handleShare = (flight) => {
    const uniqueURL = `$http://localhost:3000/shared-flights/${flight.id}`;
    setSelectedFlight(flight);
    setShareLink(uniqueURL);
    setShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied!');
  };

  const handleClose = () => setShareModal(false);

  if (savedFlights.length === 0) {
    return <h3 className="no-flights">No saved searches yet</h3>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Flights</h2>
      <Row className="g-4 saved-flights-list">
        {savedFlights.map((flight, index) => (
          <Col key={index} md={6} lg={4}>
            <Card className="flight-card mb-3 shadow-sm">
              <Card.Img 
                variant="top" 
                src={airlineImages[flight.airline] || defaultLogo} 
                alt={flight.airline || 'Default Airline'} 
              />
              <Card.Body>
                <Card.Title className="flight-title">{flight.departureAirport} – {flight.destinationAirport}</Card.Title>
                <Card.Text className="flight-info">
                  <strong>Time:</strong> {flight.departureTime} – {flight.arrivalTime}<br />
                  <strong>Duration:</strong> {flight.stops === 0 ? 'nonstop' : `${flight.stops} stop(s)`} • {flight.duration}<br />
                  <strong>Price:</strong> ${flight.price}<br />
                </Card.Text>
                <Button
                  variant="outline-primary"
                  className="me-2 share-flight-button"
                  onClick={() => handleShare(flight)}
                >
                  <i className="fas fa-share-alt"></i> Share
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Share Modal */}
      <Modal show={shareModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Share Your Flight Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="share-options">
            <strong>Share via Email:</strong>
            <a href={`mailto:?subject=Flight Details&body=Check out this flight: ${shareLink}`} className="d-block mb-3">
              Click here to share via email
            </a>
            <strong>Copy Link:</strong>
            <div className="input-group mt-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="form-control"
              />
              <Button
                variant="primary"
                onClick={handleCopyLink}
              >
                <i className="fas fa-copy"></i> Copy
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MyFlights;
