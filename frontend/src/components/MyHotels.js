import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MyHotels.css';

function MyHotels() {
  const [hotelData, setHotelData] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchDone = useRef(false);

  useEffect(() => {
    if (fetchDone.current) return;
    fetchDone.current = true;

    const fetchHotelBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:9001/api/hotel-bookings/${user?.user_id}`);
        const hotelBookings = response.data;
        setHotelData(hotelBookings);
      } catch (error) {
        console.error('Error fetching hotel bookings:', error.response || error);
      }
    };

    fetchHotelBookings();
  }, [user]);

  return (
    <div className="my-hotels-container">
      <h2>My Booked Hotels</h2>
      {hotelData.length === 0 ? (
        <p>No hotel bookings found.</p>
      ) : (
        <div className="hotels-grid">
          {hotelData.map((hotel, index) => (
            <div key={index} className="hotel-card">
              <h3>{hotel.hotel_name}</h3>
              <p><strong>Check-in:</strong> {hotel.check_in_date}</p>
              <p><strong>Check-out:</strong> {hotel.check_out_date}</p>
              <p><strong>Status:</strong> {hotel.status}</p>
              <p><strong>Number of Guests:</strong> {hotel.num_guests}</p>
              <p><strong>Rooms Booked:</strong> {hotel.room_count}</p>
              <p><strong>Total Price:</strong> ${hotel.total_price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyHotels;




