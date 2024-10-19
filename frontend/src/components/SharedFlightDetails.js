// SharedFlightDetails.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function SharedFlightDetails() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const savedFlights = useSelector((state) => state.flights.savedFlights);

  const flight = savedFlights.find((f) => f.id === flightId);

  // Check if the user is logged in
  const currentUser = useSelector((state) => state.user.currentUser);
  if (!currentUser) {
    alert('You must be logged in to view this page');
    navigate('/login');
    return null;
  }

  if (!flight) {
    return <h3>Flight not found.</h3>;
  }

  return (
    <div className="container mt-5">
      <h2>Flight Details</h2>
      <div className="flight-info">
        <p>Departure Time: {flight.departureTime}</p>
        <p>Arrival Time: {flight.arrivalTime}</p>
        <p>Departure Airport: {flight.departureAirport}</p>
        <p>Destination Airport: {flight.destinationAirport}</p>
        <p>Price: ${flight.price}</p>
      </div>
    </div>
  );
}

export default SharedFlightDetails;
