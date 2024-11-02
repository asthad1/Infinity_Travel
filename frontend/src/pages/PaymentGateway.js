import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaPaypal, FaGooglePay } from 'react-icons/fa';

function PaymentGateway() {
  const location = useLocation();
  const navigate = useNavigate();
  const { method, flight, travelers, discount } = location.state;

  const handleConfirmPayment = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.user_id;
  
      if (!userId) {
        console.error("User ID not found in localStorage.");
        alert("Unable to process booking. Please log in again.");
        return;
      }
  
      const totalPrice = (flight.price * travelers - discount).toFixed(2);
  
      const response = await axios.post('http://localhost:9001/api/book_flight', {
        user_id: userId,
        airline: flight.airline,
        flight_number: flight.flight_number,
        from_airport: flight.departure_airport,
        to_airport: flight.destination_airport,
        departure_date: flight.departure_time,
        arrival_date: flight.arrival_time,
        duration: flight.duration,
        price: flight.price,
        travelers,
        discount_applied: discount,
        total_price: totalPrice,
        payment_method: method,
      });
  
      if (response.status === 201) {
        navigate('/my-flights');
      }
    } catch (error) {
      console.error('Booking failed with error:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Booking failed. Please try again.');
    }
  };
  

  const renderIcon = () => {
    switch (method) {
      case 'Credit Card':
        return <FaCreditCard size={24} />;
      case 'PayPal':
        return <FaPaypal size={24} />;
      case 'Google Pay':
        return <FaGooglePay size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mt-5">
      <h2>Payment Gateway</h2>
      <div className="mt-4">
        <h4>Selected Payment Method</h4>
        <div className="d-flex align-items-center">
          {renderIcon()}
          <span className="ms-3">{method}</span>
        </div>
        <button className="btn btn-success mt-3" onClick={handleConfirmPayment}>
          Confirm Payment
        </button>
      </div>
    </div>
  );
}

export default PaymentGateway;
