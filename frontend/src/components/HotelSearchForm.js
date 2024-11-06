import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel, faCalendarAlt, faUser, faStar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Card, Modal, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HotelSearchForm.css';

const mockHotels = {
  // New York (ID: 12)
  12: [
    {
      id: 1,
      name: 'The Plaza New York',
      rating: 4.8,
      pricePerNight: 599,
      image: '/api/placeholder/400/250',
      amenities: ['5-Star Dining', 'Spa', 'Luxury Suites', 'Central Park Views', 'Butler Service'],
      neighborhood: 'Central Park South',
      reviewCount: 2150
    },
    {
      id: 2,
      name: 'Manhattan Sky Hotel',
      rating: 4.5,
      pricePerNight: 299,
      image: '/api/placeholder/400/250',
      amenities: ['Rooftop Bar', 'Gym', 'Restaurant', 'Business Center', 'Free Wi-Fi'],
      neighborhood: 'Times Square',
      reviewCount: 1890
    }
  ],
  // Los Angeles (ID: 11)
  11: [
    {
      id: 3,
      name: 'Beverly Hills Luxury Resort',
      rating: 4.7,
      pricePerNight: 499,
      image: '/api/placeholder/400/250',
      amenities: ['Pool', 'Spa', 'Celebrity Chef Restaurant', 'Valet Parking', 'Tennis Courts'],
      neighborhood: 'Beverly Hills',
      reviewCount: 1750
    },
    {
      id: 4,
      name: 'Santa Monica Beach Hotel',
      rating: 4.4,
      pricePerNight: 329,
      image: '/api/placeholder/400/250',
      amenities: ['Beachfront', 'Pool', 'Yoga Classes', 'Ocean View Restaurant', 'Bike Rentals'],
      neighborhood: 'Santa Monica',
      reviewCount: 2100
    }
  ],
  // Paris (ID: 24)
  24: [
    {
      id: 5,
      name: 'Le Grand Paris Palace',
      rating: 4.9,
      pricePerNight: 799,
      image: '/api/placeholder/400/250',
      amenities: ['Eiffel Tower Views', 'Michelin Star Restaurant', 'Luxury Spa', 'Concierge', 'Airport Transfer'],
      neighborhood: 'Champs-Élysées',
      reviewCount: 1580
    }
  ],
  // Tokyo (ID: 36)
  36: [
    {
      id: 6,
      name: 'Tokyo Sky Tower Hotel',
      rating: 4.6,
      pricePerNight: 450,
      image: '/api/placeholder/400/250',
      amenities: ['Sky Lounge', 'Japanese Garden', 'Sushi Restaurant', 'Tea Ceremony Room', 'Robot Concierge'],
      neighborhood: 'Shinjuku',
      reviewCount: 2300
    }
  ],
  // Dubai (ID: 50)
  50: [
    {
      id: 7,
      name: 'Burj Al Arab View Resort',
      rating: 4.9,
      pricePerNight: 899,
      image: '/api/placeholder/400/250',
      amenities: ['Private Beach', 'Infinity Pool', 'Helipad', 'Gold-Plated Furnishings', 'Underwater Restaurant'],
      neighborhood: 'Jumeirah Beach',
      reviewCount: 1950
    }
  ],
  // San Francisco (ID: 14)
  14: [
    {
      id: 8,
      name: 'Bay Area Deluxe Hotel',
      rating: 4.5,
      pricePerNight: 399,
      image: '/api/placeholder/400/250',
      amenities: ['Bay Views', 'Wine Bar', 'Tech Hub', 'Bike Rentals', 'Gourmet Restaurant'],
      neighborhood: 'Fisherman\'s Wharf',
      reviewCount: 1670
    }
  ],
  // Miami (ID: 16)
  16: [
    {
      id: 9,
      name: 'South Beach Paradise Resort',
      rating: 4.7,
      pricePerNight: 459,
      image: '/api/placeholder/400/250',
      amenities: ['Private Beach', 'Infinity Pool', 'Nightclub', 'Spa', 'Beach Service'],
      neighborhood: 'South Beach',
      reviewCount: 2200
    }
  ]
};

const HotelSearchForm = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  
  // State management
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [destination, setDestination] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add helper function for location display
  const getDisplayLocation = () => {
    if (!destination) return '';
    const state = states.find(s => s.value === selectedState?.value);
    return `${destination.label}${state ? `, ${state.label}` : ''}`;
  };

  // Fetch states and cities on component mount
  useEffect(() => {
    const fetchStatesAndCities = async () => {
      try {
        setIsLoading(true);
        const [statesResponse, citiesResponse] = await Promise.all([
          axios.get('http://localhost:9001/api/states'),
          axios.get('http://localhost:9001/api/cities')
        ]);

        const formattedStates = statesResponse.data.map(state => ({
          value: state.id,
          label: state.state_name
        }));

        const formattedCities = citiesResponse.data.map(city => ({
          value: city.id,
          label: city.city_name,
          state_id: city.state_id
        }));

        setStates(formattedStates);
        setCities(formattedCities);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setErrorMessage('Error loading location data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatesAndCities();
  }, []);

  // Filter cities based on selected state
  const filteredCityOptions = selectedState
    ? cities.filter(city => city.state_id === selectedState.value).map(city => ({
        value: city.value,
        label: `${city.label}, ${selectedState.label}`
      }))
    : cities.map(city => {
        const cityState = states.find(state => state.value === city.state_id);
        return {
          value: city.value,
          label: `${city.label}, ${cityState ? cityState.label : ''}`
        };
      });

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
      address: `${hotel.neighborhood}, ${getDisplayLocation()}`,
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
            {/* State Selection */}
            <div className="col-md-6 col-lg-3">
              <label className="form-label">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                State
              </label>
              <Select
                options={states}
                value={selectedState}
                onChange={(option) => {
                  setSelectedState(option);
                  setDestination(null);
                }}
                placeholder="Select State"
                isClearable={true}
                className="hotel-select"
                isDisabled={isLoading}
              />
            </div>

            {/* City Selection */}
            <div className="col-md-6 col-lg-3">
              <label className="form-label">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                City <span className="text-danger">*</span>
              </label>
              <Select
                options={filteredCityOptions}
                value={destination}
                onChange={setDestination}
                placeholder="Select City"
                isClearable={true}
                className="hotel-select"
                isDisabled={isLoading}
              />
            </div>

            <div className="col-md-6 col-lg-2">
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

            <div className="col-md-6 col-lg-2">
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

            <div className="col-md-6 col-lg-1">
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

            <div className="col-md-6 col-lg-1 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
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
            <h3 className="mb-3">Available Hotels in {getDisplayLocation()}</h3>
            <div className="row g-4">
              {searchResults.length > 0 ? (
                searchResults.map((hotel) => (
                  <div key={hotel.id} className="col-md-6 col-lg-4">
                    <Card className="h-100 hotel-card shadow-sm">
                      <Card.Img variant="top" src={hotel.image} alt={hotel.name} />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="d-flex justify-content-between align-items-start">
                          <span>{hotel.name}</span>
                          <span className="badge bg-primary">
                            <FontAwesomeIcon icon={faStar} className="me-1" />
                            {hotel.rating}
                          </span>
                        </Card.Title>
                        <p className="text-muted small mb-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                          {hotel.address}
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
                    No hotels available for the selected dates in {getDisplayLocation()}.
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
                    <strong>Check-in:</strong> {checkIn && new Date(checkIn).toLocaleDateString()}
                  </div>
                  <div className="mb-2">
                    <strong>Check-out:</strong> {checkOut && new Date(checkOut).toLocaleDateString()}
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