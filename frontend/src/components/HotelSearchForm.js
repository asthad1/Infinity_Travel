import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel, faCalendarAlt, faUser, faStar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Card, Modal, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './HotelSearchForm.css';

// Mock data for cities
const cityOptions = [
  { value: 'nyc', label: 'New York, NY' },
  { value: 'sfo', label: 'San Francisco, CA' },
  { value: 'mia', label: 'Miami, FL' },
  { value: 'lax', label: 'Los Angeles, CA' },
  { value: 'chi', label: 'Chicago, IL' },
  { value: 'bos', label: 'Boston, MA' },
  { value: 'sea', label: 'Seattle, WA' },
  { value: 'den', label: 'Denver, CO' }
];

// Mock hotel data with expanded properties
const mockHotels = {
  'nyc': [
    {
      id: 1,
      name: 'The Grand Plaza Hotel',
      rating: 4.5,
      pricePerNight: 299,
      image: '/api/placeholder/400/250',
      amenities: ['Pool', 'Spa', 'Restaurant', 'Gym', 'Free Wi-Fi'],
      address: '123 Broadway, New York, NY',
      neighborhood: 'Midtown Manhattan',
      reviewCount: 1250
    },
    {
      id: 2,
      name: 'Central Park View Inn',
      rating: 4.2,
      pricePerNight: 259,
      image: '/api/placeholder/400/250',
      amenities: ['Restaurant', 'Business Center', 'Gym', 'Free Wi-Fi'],
      address: '456 5th Avenue, New York, NY',
      neighborhood: 'Upper East Side',
      reviewCount: 890
    }
  ],
  'sfo': [
    {
      id: 3,
      name: 'Bay Area Luxury Hotel',
      rating: 4.7,
      pricePerNight: 399,
      image: '/api/placeholder/400/250',
      amenities: ['Pool', 'Spa', 'Restaurant', 'Bar', 'Ocean View'],
      address: '789 Market Street, San Francisco, CA',
      neighborhood: 'Financial District',
      reviewCount: 2100
    }
  ]
};

const HotelSearchForm = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [destination, setDestination] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!destination || !checkIn || !checkOut) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      setErrorMessage('Check-out date must be after check-in date.');
      return;
    }

    const hotels = mockHotels[destination.value] || [];
    const results = hotels.map(hotel => ({
      ...hotel,
      totalPrice: calculateTotalPrice(hotel.pricePerNight, checkIn, checkOut)
    }));
    setSearchResults(results);
    setShowResults(true);
  };

  const calculateTotalPrice = (pricePerNight, checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return pricePerNight * nights;
  };

  const handleBooking = (hotel) => {
    if (!user?.email) {
      navigate('/login');
      return;
    }
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  return (
    <div className="container mt-5">
      <div className="p-4 border rounded shadow-sm bg-light">
        <h2 className="mb-4 text-center">Search Hotels</h2>
        
        <form onSubmit={handleSearch} className="p-3">
          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
              <label className="form-label">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Destination <span className="text-danger">*</span>
              </label>
              <Select
                options={cityOptions}
                value={destination}
                onChange={setDestination}
                placeholder="Select City"
                isClearable={true}
                className="hotel-select"
              />
            </div>

            <div className="col-md-6 col-lg-3">
              <label className="form-label">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Check-in <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="col-md-6 col-lg-3">
              <label className="form-label">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Check-out <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="col-md-6 col-lg-2">
              <label className="form-label">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Guests
              </label>
              <input
                type="number"
                className="form-control"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                min="1"
                max="10"
              />
            </div>

            <div className="col-md-12 col-lg-1 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">
                Search
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="alert alert-danger mt-3" role="alert">
              {errorMessage}
            </div>
          )}
        </form>

        {showResults && (
          <div className="mt-4">
            <h3 className="mb-3">Available Hotels in {destination.label}</h3>
            <div className="row g-4">
              {searchResults.length > 0 ? (
                searchResults.map((hotel) => (
                  <div key={hotel.id} className="col-md-6 col-lg-4">
                    <Card className="h-100 hotel-card shadow-sm">
                      <Card.Img variant="top" src={hotel.image} alt={hotel.name} />
                      <Card.Body>
                        <Card.Title className="d-flex justify-content-between align-items-start">
                          <span>{hotel.name}</span>
                          <span className="badge bg-primary">
                            <FontAwesomeIcon icon={faStar} className="me-1" />
                            {hotel.rating}
                          </span>
                        </Card.Title>
                        <p className="text-muted small mb-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                          {hotel.neighborhood}
                        </p>
                        <div className="mb-3">
                          {hotel.amenities.map((amenity, index) => (
                            <span key={index} className="badge bg-light text-dark me-1 mb-1">
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className="fs-4 fw-bold">${hotel.totalPrice}</span>
                              <span className="text-muted"> total</span>
                            </div>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleBooking(hotel)}
                            >
                              Book Now
                            </button>
                          </div>
                          <div className="text-muted small mt-2">
                            ${hotel.pricePerNight} per night
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="col">
                  <p className="text-center text-muted">
                    No hotels available for the selected dates in {destination.label}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Booking</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedHotel && (
              <>
                <h5>{selectedHotel.name}</h5>
                <p className="mb-2">{selectedHotel.address}</p>
                <div className="mb-3">
                  <div className="mb-2">
                    <strong>Check-in:</strong> {new Date(checkIn).toLocaleDateString()}
                  </div>
                  <div className="mb-2">
                    <strong>Check-out:</strong> {new Date(checkOut).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Guests:</strong> {guests}
                  </div>
                </div>
                <div className="alert alert-info">
                  <strong>Total Price:</strong> ${selectedHotel.totalPrice}
                </div>
                <p className="mb-0">Would you like to proceed with the booking?</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Confirm Booking
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default HotelSearchForm;