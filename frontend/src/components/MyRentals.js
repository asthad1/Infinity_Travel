import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyRentals.css';
import { useSelector } from 'react-redux';

// Import rental images
import bmwImage from '../assets/images/rentals/BMW.jpg';
import chevyImage from '../assets/images/rentals/Chevy-tahoe.jpg';
import ferrariImage from '../assets/images/rentals/Ferrari.jpg';
import fordEscapeImage from '../assets/images/rentals/Ford-escpae.jpg';
import hondaCivicImage from '../assets/images/rentals/Honda-civic.jpg';
import lamborghiniImage from '../assets/images/rentals/Lamborghini.jpg';
import nissanImage from '../assets/images/rentals/Nissan.jpg';
import teslaImage from '../assets/images/rentals/Tesla.jpg';
import toyotaImage from '../assets/images/rentals/toyota.jpg';

// Map rental names to images
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

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const userData = JSON.parse(localStorage.getItem('user'));
    const userId = userData?.user_id;
  
    useEffect(() => {
      const fetchMyRentals = async () => {
        if (!userId) {
          setErrorMessage('Please log in to view your rentals.');
          return;
        }
        
        try {
          const response = await axios.get(`http://localhost:9001/api/rentals/my-rentals/${userId}`);
          setRentals(response.data);
        } catch (error) {
          setErrorMessage('Error loading your rentals. Please try again later.');
        }
      };
      fetchMyRentals();
    }, [userId]);
  
    return (
      <div className="my-rentals-container">
        <h2>My Rentals</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="rental-list">
          {rentals.map((rental) => (
            <div key={rental.id} className="rental-card">
              <div
                className="rental-image"
                style={{ backgroundImage: `url(${imageMap[rental.rental_name]})` }}
              />
              <div className="rental-details">
                <h5>{rental.rental_name}</h5>
                <p>Pickup Date: {rental.pickup_date}</p>
                <p>Pickup Time: {rental.pickup_time}</p>
                <p>Drop-off Date: {rental.drop_off_date}</p>
                <p>Drop-off Time: {rental.dropoff_time}</p>
                <p>Total Price: ${rental.total_price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default MyRentals;
