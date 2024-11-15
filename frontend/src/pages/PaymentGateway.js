import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaPaypal, FaGooglePay } from 'react-icons/fa';

function PaymentGateway() {
  const location = useLocation();
  const navigate = useNavigate();
  const { method, flight, travelers, discount } = location.state;
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: '',
    cardNumber: '',
    expirationDate: '',
    cvv: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({ ...cardDetails, [name]: value });
  };

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
      const couponCode = sessionStorage.getItem('coupon_code');
      
      if (couponCode) {
        try {
          const redeemResponse = await axios.post('http://localhost:9001/api/redeem_coupon', {
            coupon_code: couponCode,
            user: user.email,
          });

          if (redeemResponse.status !== 200) {
            alert(redeemResponse.data.error || 'Coupon redemption failed. Proceeding without discount.');
          } else {
            console.log('Coupon redeemed successfully:', redeemResponse.data);
            sessionStorage.removeItem('coupon_code'); // Remove coupon code after redemption
          }
        } catch (error) {
          console.error('Error redeeming coupon:', error.response?.data || error.message);
          alert('Coupon redemption failed. Please try again.');
          return;
        }
      }

      // Simulate the booking being stored
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
        alert('Payment confirmed and booking stored successfully!');
        // Trigger email notification API
        await axios.post('http://localhost:9001/api/send_email_notifications', { user_id: userId, booking_id: response.data.booking_id });
        navigate('/my-flights');
      }
    } catch (error) {
      console.error('Booking failed with error:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Booking failed. Please try again.');
    }
  };

  const renderForm = () => {
    if (method === 'Credit Card') {
      return (
        <div className="credit-card-form mt-3">
          <h5>Enter Credit Card Details</h5>
          <input
            type="text"
            name="nameOnCard"
            placeholder="Name on Card"
            value={cardDetails.nameOnCard}
            onChange={handleInputChange}
            className="form-control mb-2"
          />
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={cardDetails.cardNumber}
            onChange={handleInputChange}
            className="form-control mb-2"
          />
          <input
            type="text"
            name="expirationDate"
            placeholder="MM/YY"
            value={cardDetails.expirationDate}
            onChange={handleInputChange}
            className="form-control mb-2"
          />
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            value={cardDetails.cvv}
            onChange={handleInputChange}
            className="form-control mb-2"
          />
        </div>
      );
    } else if (method === 'PayPal' || method === 'Google Pay') {
      return (
        <div className="payment-simulation mt-3">
          <h5>Simulated {method} Payment</h5>
          <p>{method} overlay would be shown here in a real application.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mt-5">
      <h2>Payment Gateway</h2>
      <div className="mt-4">
        <h4>Selected Payment Method</h4>
        <div className="d-flex align-items-center">
          {method === 'Credit Card' && <FaCreditCard size={24} />}
          {method === 'PayPal' && <FaPaypal size={24} />}
          {method === 'Google Pay' && <FaGooglePay size={24} />}
          <span className="ms-3">{method}</span>
        </div>
        {renderForm()}
        <button className="btn btn-success mt-3" onClick={handleConfirmPayment}>
          Confirm Payment
        </button>
      </div>
    </div>
  );
}

export default PaymentGateway;
