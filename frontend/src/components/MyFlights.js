import React, { useEffect, useState } from 'react';

function MyFlights() {
  const [flights, setFlights] = useState([]);

  // Retrieve flight data from localStorage when the component mounts
  useEffect(() => {
    const storedFlights = JSON.parse(localStorage.getItem('myFlights')) || [];
    setFlights(storedFlights);
  }, []);

  if (flights.length === 0) {
    return <div>No flights have been booked yet.</div>;
  }

  return (
    <div className="container mt-5">
      <h2>My Booked Flights</h2>
      <ul className="list-group">
        {flights.map((flight, index) => (
          // Ensure flight object and its properties exist before rendering
          flight && (
            <li key={index} className="list-group-item">
              <strong>Airline:</strong> {flight.airline || 'N/A'}
              <br />
              <strong>Flight Number:</strong> {flight.flight_number || 'N/A'}
              <br />
              <strong>Departure:</strong> {flight.departure_airport || 'N/A'}
              <br />
              <strong>Destination:</strong> {flight.destination_airport || 'N/A'}
              <br />
              <strong>Departure Time:</strong> {flight.departure_time || 'N/A'}
              <br />
              <strong>Arrival Time:</strong> {flight.arrival_time || 'N/A'}
              <br />
              <strong>Duration:</strong> {flight.duration || 'N/A'}
              <br />
              <strong>Price:</strong> ${flight.price || 'N/A'}
              <br />
              <strong>Number of Travelers:</strong> {flight.travelers || 'N/A'}
            </li>
          )
        ))}
      </ul>
    </div>
  );
}

export default MyFlights;
