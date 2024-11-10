import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCalendarAlt, faMapMarkerAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RentalSearchForm.css';

import bmwImage from '../assets/images/rentals/BMW.jpg';
import chevyImage from '../assets/images/rentals/Chevy-tahoe.jpg';
import ferrariImage from '../assets/images/rentals/Ferrari.jpg';
import fordEscapeImage from '../assets/images/rentals/Ford-escpae.jpg';
import hondaCivicImage from '../assets/images/rentals/Honda-civic.jpg';
import lamborghiniImage from '../assets/images/rentals/Lamborghini.jpg';
import nissanImage from '../assets/images/rentals/Nissan.jpg';
import teslaImage from '../assets/images/rentals/Tesla.jpg';
import toyotaImage from '../assets/images/rentals/toyota.jpg';

const imageMap = {
    'BMW 3 Series': bmwImage,
    'Chevrolet Tahoe': chevyImage,
    'Ferrari Portofino': ferrariImage,
    'Ford Escape': fordEscapeImage,
    'Honda Civic': hondaCivicImage,
    'Lamborghini Huracan': lamborghiniImage,
    'Nissan Altima': nissanImage,
    'Tesla Model S': teslaImage,
    'Toyota Corolla': toyotaImage,
};

const RentalSearchForm = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [cities, setCities] = useState([]);
    const [pickupCity, setPickupCity] = useState(null);
    const [dropOffCity, setDropOffCity] = useState(null);
    const [pickupDate, setPickupDate] = useState('');
    const [dropOffDate, setDropOffDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [dropOffTime, setDropOffTime] = useState('');
    const [driverAge, setDriverAge] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedRental, setSelectedRental] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchCities = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('http://localhost:9001/api/cities');
                setCities(response.data.map(city => ({
                    value: city.id,
                    label: city.city_name
                })));
            } catch (error) {
                setErrorMessage('Error loading cities. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCities();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const today = new Date().toISOString().split('T')[0];
        if (!pickupCity || !dropOffCity || !pickupDate || !dropOffDate || !pickupTime || !dropOffTime || !driverAge) {
            setErrorMessage('Please fill in all fields.');
            return;
        }
        if (pickupDate < today) {
            setErrorMessage('Pickup date cannot be in the past.');
            return;
        }
        if (pickupDate >= dropOffDate) {
            setErrorMessage('Pickup date must be before drop-off date.');
            return;
        }
        if (driverAge < 20 || driverAge > 100) {
            setErrorMessage('Driver age must be between 20 and 100.');
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post('http://localhost:9001/api/rentals/search', {
                pickupLocation: pickupCity.value,
                dropOffLocation: dropOffCity.value,
                pickupDate,
                dropOffDate,
                pickupTime,
                dropOffTime,
                driverAge
            });
            setSearchResults(response.data);
        } catch (error) {
            setErrorMessage('Error searching rentals. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!selectedRental) return;

        const userData = JSON.parse(localStorage.getItem('user'));
        const user_id = userData?.user_id;

        if (!user_id) {
            setErrorMessage('User is not logged in. Please log in to book a rental.');
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post('http://localhost:9001/api/rentals/book', {
                rental_id: selectedRental.id,
                user_id: user_id,
                pickup_date: pickupDate,
                pickup_time: pickupTime,  // Include pickup_time
                drop_off_date: dropOffDate,
                dropoff_time: dropOffTime,  // Include dropoff_time
                total_price: selectedRental.price_per_day * (new Date(dropOffDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)
            });

            setShowModal(false);
            alert(`Booking Successful! Booking ID: ${response.data.booking_id}`);
            navigate('/my-rentals');
        } catch (error) {
            setErrorMessage('Error booking rental. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="container mt-5">
            <h2>Search Car Rentals</h2>
            <form onSubmit={handleSearch} className="p-3">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                            Pickup City
                        </label>
                        <Select
                            options={cities}
                            value={pickupCity}
                            onChange={setPickupCity}
                            placeholder="Select Pickup City"
                            isClearable
                        />
                    </div>
                    <div className="col-md-6">
                        <label>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                            Drop-off City
                        </label>
                        <Select
                            options={cities}
                            value={dropOffCity}
                            onChange={setDropOffCity}
                            placeholder="Select Drop-off City"
                            isClearable
                        />
                    </div>
                    <div className="col-md-6">
                        <label>
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                            Pickup Date/Time
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                        />
                        <input
                            type="time"
                            className="form-control mt-1"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label>
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                            Drop-off Date/Time
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            value={dropOffDate}
                            onChange={(e) => setDropOffDate(e.target.value)}
                            min={pickupDate}
                        />
                        <input
                            type="time"
                            className="form-control mt-1"
                            value={dropOffTime}
                            onChange={(e) => setDropOffTime(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label>
                            <FontAwesomeIcon icon={faUser} className="me-2" />
                            Driver Age
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            value={driverAge}
                            onChange={(e) => setDriverAge(e.target.value)}
                            min="20"
                            max="100"
                        />
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                        <Button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Search'}
                        </Button>
                    </div>
                </div>
                {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
            </form>

            {searchResults.length > 0 && (
                <div className="mt-4">
                    <h3>Available Rentals</h3>
                    <div className="row">
                        {searchResults.map((rental) => (
                            <div key={rental.id} className="col-md-4">
                                <div className="card rental-card shadow-sm">
                                    <img
                                        src={imageMap[rental.name]}
                                        alt={rental.name}
                                        className="card-img-top"
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{rental.name}</h5>
                                        <p>Pickup City: {rental.pickup_city}</p>
                                        <p>Drop-off City: {rental.drop_off_city}</p>
                                        <p>Price per Day: ${rental.price_per_day}</p>
                                        <Button
                                            className="btn btn-primary mt-2"
                                            onClick={() => {
                                                setSelectedRental(rental);
                                                setShowModal(true);
                                            }}
                                        >
                                            Book Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Rental Booking</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRental && (
                        <>
                            <img
                                src={imageMap[selectedRental.name]}
                                alt={selectedRental.name}
                                style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }}
                            />
                            <h5>{selectedRental.name}</h5>
                            <p style={{ color: 'black' }}>Pickup Date: {pickupDate}</p>
                            <p style={{ color: 'black' }}>Drop-off Date: {dropOffDate}</p>
                            <p style={{ color: 'black' }}>
                                Total Price: $
                                {(new Date(dropOffDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24) * selectedRental.price_per_day}
                            </p>
                            <p style={{ color: 'black' }}>Would you like to proceed with the booking?</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleBooking}>
                        Confirm Booking
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RentalSearchForm;
