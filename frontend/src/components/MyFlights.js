import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlaneDeparture, 
  faPlaneArrival, 
  faClock, 
  faUsers,
  faDollarSign,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import Notifications from './Notifications';
import './MyFlights.css';

// Import airline images
const airlineImages = {
  'Air France': require('../assets/images/airlines/air-france.jpg'),
  'American Airlines': require('../assets/images/airlines/american-airlines.png'),
  'British Airways': require('../assets/images/airlines/british.png'),
  'Cathay Pacific': require('../assets/images/airlines/cathay.jpg'),
  'Delta': require('../assets/images/airlines/delta.png'),
  'Emirates': require('../assets/images/airlines/emirates.png'),
  'Lufthansa': require('../assets/images/airlines/lufthansa.png'),
  'Qatar Airways': require('../assets/images/airlines/qatar.jpg'),
  'Singapore Airlines': require('../assets/images/airlines/singapore.png'),
  'United': require('../assets/images/airlines/united.png'),
  'default': require('../assets/images/airlines/default-logo.png')
};

function MyFlights() {
  const [flights, setFlights] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await axios.get('http://localhost:9001/api/booked_flights', {
          params: { user_id: user.user_id },
        });
        setFlights(response.data);
      } catch (error) {
        console.error('Error fetching booked flights:', error);
      }
    };

    if (user?.user_id) {
      fetchFlights();
    }
  }, [user]);

  const getAirlineLogo = (airline) => {
    return airlineImages[airline] || airlineImages.default;
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  if (flights.length === 0) {
    return (
      <div className="empty-flights-container">
        <div className="empty-flights-content">
          <FontAwesomeIcon icon={faPlaneDeparture} className="empty-icon" />
          <h2>No Flights Booked Yet</h2>
          <p>Your booked flights will appear here once you make a reservation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-flights-container">
      <Notifications flights={flights} />
      <h2 className="page-title">My Booked Flights</h2>
      <div className="flights-grid">
        {flights.map((flight, index) => (
          <div key={index} className="flight-card">
            <div className="airline-header">
              <img 
                src={getAirlineLogo(flight.airline)} 
                alt={flight.airline} 
                className="airline-logo"
              />
              <div className="flight-number">
                Flight {flight.flight_number}
              </div>
            </div>
            
            <div className="flight-details">
              <div className="route-info">
                <h5>From: </h5>
                <div className="departure">
                  <FontAwesomeIcon icon={faPlaneDeparture} className="icon" />
                  <div className="location">
                    <h3>{flight.departure_airport}</h3>
                    <p>{formatDateTime(flight.departure_time)}</p>
                  </div>
                </div>
                
                <div className="duration">
                  <div className="duration-line"></div>
                  <span>{flight.duration}</span>
                </div>
                
                <h5>To: </h5>
                <div className="arrival">
                  <FontAwesomeIcon icon={faPlaneArrival} className="icon" />
                  <div className="location">
                    <h3>{flight.destination_airport}</h3>
                    <p>{formatDateTime(flight.arrival_time)}</p>
                  </div>
                </div>
              </div>

              <div className="flight-info">
                <div className="info-item">
                  <FontAwesomeIcon icon={faUsers} className="icon" />
                  <span>{flight.travelers} Travelers</span>
                </div>
                <div className="info-item">
                  <FontAwesomeIcon icon={faDollarSign} className="icon" />
                  <span>${flight.total_price}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyFlights;
