import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function Checkout() {
  const location = useLocation();
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
      const response = await fetch('http://localhost:9001/api/validate_coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discount_code: discountCode }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setMessage(data.error || 'Failed to apply discount');
        setDiscount(0);
        setIsError(true);
      } else {
        setDiscount(data.discount_percentage / 100);  // Assuming discount percentage
        setMessage(data.success);
        setIsError(false);
      }
    } catch (error) {
      setMessage('An error occurred while applying the discount.');
      setDiscount(0);
      setIsError(true);
    }
  };
  

  const totalPrice = (flight.price * travelers * (1 - discount)).toFixed(2);
  const originalPrice = (flight.price * travelers).toFixed(2);

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>
      <div>
        <strong>Airline:</strong> {flight.airline}
        <br />
        <strong>Flight Number:</strong> {flight.flightNumber}
        <br />
        <strong>Departure:</strong> {flight.departureTime}
        <br />
        <strong>Arrival:</strong> {flight.arrivalTime}
        <br />
        <strong>Duration:</strong> {flight.duration}
        <br />
        <strong>Price (per ticket):</strong> ${flight.price}
        <br />
        <strong>Number of Stops:</strong> {flight.stops}
        <br />
        <strong>Available Seats:</strong> {flight.availableSeats}
        <br />
        <strong>Number of Travelers:</strong> {travelers}
        <br />
        <strong>
          Total Price:
          {discount > 0 && (
            <>
              <span style={{ textDecoration: 'line-through', marginLeft: '10px' }}>
                ${originalPrice}
              </span>
              <span style={{ color: 'green', fontWeight: 'bold', marginLeft: '10px' }}>
                ${totalPrice}
              </span>
            </>
          )}
          {discount === 0 && (
            <span style={{ marginLeft: '10px' }}>
              ${originalPrice}
            </span>
          )}
        </strong>
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
      </div>
      <button className="btn btn-primary mt-2" onClick={handleDiscountSubmit}>
        Apply Discount
      </button>

      <div className="mt-2">
        {message && (
          <div className={isError ? 'text-danger' : 'text-success'}>
            {message}
          </div>
        )}
      </div>

      {/* Purchase button is consistently placed below the messages */}
      <button className="btn btn-success mt-3">Purchase</button>
    </div>
  );
}

export default Checkout;
