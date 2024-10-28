import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const flight = location.state?.flight;
  const travelers = location.state?.travelers;

  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  if (!flight) {
    return <div>No flight information available.</div>;
  }

  const handleDiscountSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));

      // Send discountCode and user_id to the API
      const response = await axios.post('http://localhost:9001/api/validate_coupon', {
        discount_code: discountCode,
        user: user["email"]
      });

      const data = response.data;

      if (response.status !== 200) {
        setMessage(data.error || 'Failed to apply discount');
        setDiscount(0);
        setIsError(true);
      } else {
        setDiscount(data.discount_percentage / 100);
        setMessage(data.success || 'Discount applied successfully');
      setIsError(false);
      }
    } catch (error) {
      // Display the error message from the API response if available
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Failed to apply discount');
      }
      setDiscount(0);
      setIsError(true);
    }
  };

  const handlePurchase = () => {
    setPurchaseSuccess(true);

    // Here you can add code to save flight details after purchase
    const purchasedFlight = {
      airline: flight.airline,
      flight_number: flight.flight_number,
      departure_airport: flight.departure_airport,
      destination_airport: flight.destination_airport,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      duration: flight.duration,
      price: flight.price,
      travelers,
    };

    // Save the flight details to local storage
    const storedFlights = JSON.parse(localStorage.getItem('myFlights')) || [];
    storedFlights.push(purchasedFlight);
    localStorage.setItem('myFlights', JSON.stringify(storedFlights));

    setTimeout(() => {
      navigate('/');
    }, 3000); // Redirect to home page after 3 seconds
  };

  const totalPrice = (flight.price * travelers * (1 - discount)).toFixed(2);
  const originalPrice = (flight.price * travelers).toFixed(2);

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>
      <div>
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

      {/* Purchase button */}
      <button className="btn btn-success mt-3" onClick={handlePurchase}>
        Purchase
      </button>

      {purchaseSuccess && (
        <div className="alert alert-success mt-3">
          Flight ticket purchased successfully! Redirecting to home page...
        </div>
      )}
    </div>
  );
}

export default Checkout;
