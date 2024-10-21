import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SharedFlightDetails() {
  const { flightId } = useParams();  // Get flightId from the URL params
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');

    // Redirect to login if user_id is not found in localStorage
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch flight details from the API
    axios.get(`http://localhost:9001/api/flights/${flightId}`)
      .then(response => {
        setFlight(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching flight details:', error);
        setLoading(false);
      });
  }, [flightId, navigate]);

  if (loading) {
    return <p>Loading flight details...</p>;
  }

  if (!flight) {
    return <p>Flight not found.</p>;
  }

  return (
    <div className="container mt-5">
      <h2>Flight Details</h2>
      <div className="flight-info">
        <p>Flight Number: {flight.flight_name}</p>
        <p>Airline: {flight.airline}</p>
        <p>Departure: {flight.from_airport} at {new Date(flight.departure).toLocaleString()}</p>
        <p>Arrival: {flight.to_airport} at {new Date(flight.arrival).toLocaleString()}</p>
        <p>Price: ${flight.fare}</p>
        <p>Stops: {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}</p>
      </div>
    </div>
  );
}

export default SharedFlightDetails;
