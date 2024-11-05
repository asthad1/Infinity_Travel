import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaPaypal, FaGooglePay } from 'react-icons/fa';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const flight = location.state?.flight;
  const travelers = location.state?.travelers;

  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  if (!flight) {
    return <div>No flight information available.</div>;
  }

  const handleDiscountSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await axios.post('http://localhost:9001/api/validate_coupon', {
        coupon_code: discountCode,
        user: user["email"]
      });

      const data = response.data;

      if (response.status !== 200) {
        setMessage(data.error || 'Failed to apply discount');
        setDiscount(0);
        setIsError(true);
      } else {
        // store the discount code in a session
        sessionStorage.setItem('coupon_code', discountCode);
        setDiscount(data.discount_amount);
        setMessage(data.success || 'Discount applied successfully');
        setIsError(false);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Failed to apply discount');
      }
      setDiscount(0);
      setIsError(true);
    }
  };

  const handlePurchase = async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    const response = await axios.post('http://localhost:9001/api/redeem_coupon', {
      coupon_code: discountCode,
      user: user["email"]
    });

    if (response.status !== 200) {
      setMessage(data.error || 'Failed to purchase with discount');
      setIsError(true);
    } else {
      setPurchaseSuccess(true);
    }
    navigate('/payment-gateway', { state: { method, flight, travelers, discount } });
  };

  const totalPrice = (flight.price * travelers - discount).toFixed(2);
  const originalPrice = (flight.price * travelers).toFixed(2);

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>
      <div>
        {/* Flight Details */}
        <strong>Airline:</strong> {flight.airline}
        <br />
        <strong>Flight Number:</strong> {flight.flight_number}
        <br />
        <strong>Departure:</strong> {flight.departure_airport}
        <br />
        <strong>Destination:</strong> {flight.destination_airport}
        <br />
        <strong>Departure Time:</strong> {flight.departure_time}
        <br />
        <strong>Arrival Time:</strong> {flight.arrival_time}
        <br />
        <strong>Duration:</strong> {flight.duration}
        <br />
        <strong>Price (per ticket):</strong> ${flight.price}
        <br />
        <strong>Number of Stops:</strong> {flight.stops}
        <br />
        <strong>Available Seats:</strong> {flight.available_seats}
        <br />
        <strong>Number of Travelers:</strong> {travelers}
        <br />
        <strong>Total Price:</strong>
        {discount > 0 ? (
          <>
            <span style={{ textDecoration: 'line-through', marginLeft: '10px' }}>
              ${originalPrice}
            </span>
            <span style={{ color: 'green', fontWeight: 'bold', marginLeft: '10px' }}>
              ${totalPrice}
            </span>
          </>
        ) : (
          <span style={{ marginLeft: '10px' }}>${originalPrice}</span>
        )}
      </div>

      <div className="mt-3">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Discount code"
          className="form-control"
          style={{ width: '200px', display: 'inline-block' }}
        />
        <button className="btn btn-primary mt-2 ms-3" onClick={handleDiscountSubmit}>
          Apply Discount
        </button>
      </div>

      <div className="mt-2">
        {message && (
          <div className={isError ? 'text-danger' : 'text-success'}>
            {message}
          </div>
        )}
      </div>

      {/* Payment Options */}
      <div className="mt-4">
        <h4>Select Payment Method</h4>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-primary me-3"
            onClick={() => handlePurchase("Credit Card")}
          >
            <FaCreditCard size={24} className="me-2" />
            Credit Card
          </button>
          <button
            className="btn btn-outline-primary me-3"
            onClick={() => handlePurchase("PayPal")}
          >
            <FaPaypal size={24} className="me-2" />
            PayPal
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => handlePurchase("Google Pay")}
          >
            <FaGooglePay size={24} className="me-2" />
            Google Pay
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
