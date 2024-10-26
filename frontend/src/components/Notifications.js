import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './Notifications.css';

function Notifications({ flights }) {
  const now = new Date();
  const upcomingFlights = flights.filter(flight => {
    const departureTime = new Date(flight.departure_time);
    const timeDifference = departureTime - now;
    return timeDifference > 0 && timeDifference <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  });

  useEffect(() => {
    // Store the number of notifications in local storage
    localStorage.setItem('notificationCount', upcomingFlights.length);
  }, [upcomingFlights.length]); // Run this effect whenever the count changes

  if (upcomingFlights.length === 0) {
    return null; // No notifications to display
  }

  const flightCountMessage = upcomingFlights.length === 1 
  ? "You have a flight within 24 hours!" 
  : `You have ${upcomingFlights.length} flights within 24 hours!`;

  return (
    <div className="notifications-container">
      <h3 className="notification-header">
        <FontAwesomeIcon icon={faExclamationTriangle} className="notification-icon" />
        {flightCountMessage}
      </h3>
      <br />
      <div className="notifications-list">
        {upcomingFlights.map((flight, index) => (
          <div key={index} className="notification-box">
            <strong>Flight {flight.flight_number}</strong><br />
            From: {flight.departure_airport}<br />
            To: {flight.destination_airport}<br />
            Departure Time: {new Date(flight.departure_time).toLocaleTimeString()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
