import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHotel, faCalendarAlt, faUser, faStar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Card, Modal, Button, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './HotelSearchForm.css';
import hotel1 from '../assets/images/hotels/hotel-1.webp';
import hotel2 from '../assets/images/hotels/hotel-2.jpg';
import hotel3 from '../assets/images/hotels/hotel-3.jpg';
import hotel4 from '../assets/images/hotels/hotel-4.jpg';

const hotelImages = [hotel1, hotel2, hotel3, hotel4];

const HotelSearchForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Display location helper
  const getDisplayLocation = () => {
    return destination ? destination.label : '';
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
        setErrorMessage('Error loading location data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatesAndCities();
  }, []);

  // Interdependent dropdowns
  const filteredStates = destination
    ? states.filter(state => state.value === cities.find(city => city.value === destination.value)?.state_id)
    : states;

  const filteredCities = selectedState
    ? cities.filter(city => city.state_id === selectedState.value)
    : cities;

  // Handle State change
  const handleStateChange = (option) => {
    setSelectedState(option);
    if (option) {
      // If a state is selected, filter cities to that state
      const citiesInState = cities.filter(city => city.state_id === option.value);
      if (destination && !citiesInState.find(city => city.value === destination.value)) {
        // If selected city is not in the new state, reset destination
        setDestination(null);
      }
    } else {
      // If state is cleared, reset city selection
      setDestination(null);
    }
  };

  // Handle City change
  const handleCityChange = (option) => {
    setDestination(option);
    if (option) {
      // If a city is selected, set the state to the city's state
      const city = cities.find(city => city.value === option.value);
      const state = states.find(state => state.value === city.state_id);
      setSelectedState(state);
    } else {
      // If city is cleared, reset state selection
      setSelectedState(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Ensure all fields are filled out
    if (!destination || !selectedState || !checkIn || !checkOut || !guests) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      setErrorMessage('Check-out date must be after check-in date.');
      return;
    }

    try {
      setIsLoading(true);
      const searchData = {
        city_id: destination.value,
        check_in: checkIn,
        check_out: checkOut,
        guests: parseInt(guests)
      };

      // Add price range if it exists in location state
      if (location.state?.hotelSearch?.priceRange) {
        searchData.priceRange = location.state.hotelSearch.priceRange;
      }

      const response = await axios.post('http://localhost:9001/api/hotels/search', searchData);

      const hotels = response.data.map((hotel, index) => ({
        ...hotel,
        // Parse amenities as an array of strings
        amenities: typeof hotel.amenities === 'string' ? hotel.amenities.split(',') : [],
        // Assign one of the imported images based on index, cycling through hotelImages
        image: hotelImages[index % hotelImages.length],
        totalPrice: calculateTotalPrice(hotel.price_per_night, checkIn, checkOut)
      }));

      setSearchResults(hotels);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching hotels:', error);
      setErrorMessage('Error searching hotels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPrice = (pricePerNight, checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return pricePerNight * nights;
  };

  // Handle hotel booking
  const handleBooking = async (hotel) => {
    if (!user?.email) {
      navigate('/login');
      return;
    }

    try {
      const bookingData = {
        user_id: user.user_id,
        hotel_id: hotel.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        num_guests: parseInt(guests),
        room_count: 1,
        total_price: hotel.totalPrice,
        payment_method: 'credit_card'
      };

      const response = await axios.post('http://localhost:9001/api/hotel-bookings', bookingData);
      if (response.data) {
        navigate('/booking-confirmation', { 
          state: { 
            booking: response.data,
            hotel: hotel 
          }
        });
      }
    } catch (error) {
      console.error('Error booking hotel:', error);
      setErrorMessage('Error booking hotel. Please try again.');
    }
  };

  // Add function to generate random future dates
  const getRandomFutureDates = () => {
    const today = new Date();
    // Random start date between tomorrow and 3 months from now
    const startDays = Math.floor(Math.random() * 90) + 1;
    const checkInDate = new Date(today.setDate(today.getDate() + startDays));
    
    // Random length of stay between 1 and 14 days
    const stayLength = Math.floor(Math.random() * 14) + 1;
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + stayLength);

    return {
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0]
    };
  };

  // Add effect to handle pre-populated search
  useEffect(() => {
    const handlePrePopulatedSearch = async () => {
      if (!location.state?.hotelSearch) return;
      
      const params = location.state.hotelSearch;
      console.log('Processing hotel search params:', params);

      // Wait for states and cities to be loaded before setting values
      if (states.length > 0 && cities.length > 0) {
        try {
          // Find Missouri state object
          const missouriState = states.find(state => state.label === "Missouri") || 
                                {value: params.stateId, label: "Missouri"};
          setSelectedState(missouriState);

          // Then set the destination (city)
          setDestination({
            value: params.destination.value,
            label: params.destination.label,
            state_id: missouriState.value
          });

          setCheckIn(params.checkIn);
          setCheckOut(params.checkOut);
          setGuests(params.guests);

          // If autoSearch flag is true, trigger search automatically
          if (params.autoSearch) {
            const searchEvent = { preventDefault: () => {} };
            // Add slight delay to ensure state updates have processed
            setTimeout(() => {
              handleSearch(searchEvent);
            }, 100);
          }
        } catch (error) {
          console.error('Error setting up search parameters:', error);
        }
      }
    };

    handlePrePopulatedSearch();
  }, [location.state, states, cities]); // Add handleSearch to dependency array if needed

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
                State <span className="text-danger">*</span>
              </label>
              <Select
                options={filteredStates}
                value={selectedState}
                onChange={handleStateChange}
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
                options={filteredCities}
                value={destination}
                onChange={handleCityChange}
                placeholder="Select City"
                isClearable={true}
                className="hotel-select"
                isDisabled={isLoading}
              />
            </div>

            {/* Check-in Date */}
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
                required
              />
            </div>

            {/* Check-out Date */}
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
                required
              />
            </div>

            {/* Guests */}
            <div className="col-md-6 col-lg-1">
              <label className="form-label">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Guests <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                min="1"
                max="10"
                required
              />
            </div>

            {/* Search Button */}
            <div className="col-md-6 col-lg-1 d-flex align-items-end">
              <button type="submit" className="btn btn-primary custom-search-button" disabled={isLoading}>
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

        {isLoading && <Spinner animation="border" className="my-4" />}

        {showResults && (
          <div className="mt-4">
            <h3 className="mb-3">Available Hotels in {getDisplayLocation()}</h3>
            <div className="row g-4">
              {searchResults.length > 0 ? (
                searchResults.map((hotel, index) => (
                  <div key={hotel.id} className="col-md-6 col-lg-4">
                    <Card className="h-100 hotel-card shadow-sm">
                      <Card.Img 
                        variant="top" 
                        src={hotel.image} 
                        alt={hotel.name}
                        className="hotel-image" 
                      />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="d-flex justify-content-between align-items-start">
                          <span>{hotel.name}</span>
                          <div className="d-flex align-items-center">
                            {index === 0 && (
                              <span className="badge bg-warning text-dark me-2">Sponsored</span>
                            )}
                            <span className="badge bg-primary">
                              <FontAwesomeIcon icon={faStar} className="me-1" />
                              {hotel.rating}
                            </span>
                          </div>
                        </Card.Title>
                        <p className="text-muted small mb-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                          {hotel.address}
                          {hotel.neighborhood && `, ${hotel.neighborhood}`}
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
                            ${hotel.price_per_night} per night
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