import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlaneDeparture,
  faPlaneArrival,
  faUsers,
  faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import Notifications from './Notifications';
import './MyFlights.css';
import { useFlightContext } from '../context/FlightContext';
import { useDispatch } from 'react-redux';
import { updateTravelCredit } from '../store/travelCreditSlice';

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
  default: require('../assets/images/airlines/default-logo.png'),
};

function MyFlights() {
  const [flights, setFlights] = useState([]);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const { setTotalFlightPrice } = useFlightContext();
  const dispatch = useDispatch(); // Use Redux dispatch

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await axios.get('http://localhost:9001/api/booked_flights', {
          params: { user_id: user.user_id },
        });

        const confirmedFlights = response.data.filter((flight) => flight.status === 'confirmed');
        setFlights(confirmedFlights);
      } catch (error) {
        console.error('Error fetching booked flights:', error);
      }
    };

    if (user?.user_id) {
      fetchFlights();
    }
  }, [user]);

  useEffect(() => {
    const total = flights.reduce((total, flight) => total + parseFloat(flight.total_price), 0);
    setTotalFlightPrice(Math.round(total));
  }, [flights, setTotalFlightPrice]);

  const getAirlineLogo = (airline) => airlineImages[airline] || airlineImages.default;

  const formatDateTime = (dateTimeString) =>
    new Date(dateTimeString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

  const handleCancelFlight = async (flight) => {
    const now = new Date();
    const departureTime = new Date(flight.departure_time);
    const timeDifference = (departureTime - now) / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (timeDifference > 4) {
      refundPercentage = 1; // Full refund
    } else if (timeDifference >= 2 && timeDifference <= 4) {
      refundPercentage = 0.5; // 50% refund
    } else {
      setMessage(`Flight ${flight.flight_number} cannot be canceled (less than 2 hours to departure).`);
      return;
    }

    const refundAmount = flight.total_price * refundPercentage;

    try {
      // Cancel the flight
      const cancelResponse = await axios.post('http://localhost:9001/api/cancel_flight', {
        booking_id: flight.id,
      });

      if (cancelResponse.data.status !== 'canceled') {
        throw new Error('Failed to cancel flight');
      }

      // Update travel credit
      await axios.post('http://localhost:9001/api/travel_credit', {
        user_id: user.user_id,
        credit_change: refundAmount,
      });

      // Dispatch Redux action to update travel credit
      dispatch(updateTravelCredit(refundAmount));

      // Update flight list and display success message
      setFlights((prevFlights) => prevFlights.filter((f) => f.id !== flight.id));
      setMessage(
        `Flight ${flight.flight_number} has been canceled. A refund of $${refundAmount.toFixed(
          2
        )} has been issued as travel credit.`
      );
    } catch (error) {
      console.error('Error canceling flight or updating travel credit:', error);
      setMessage('An error occurred while canceling the flight. Please try again.');
    }
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
      {message && <div className="notification-banner">{message}</div>}
      <Notifications flights={flights} />
      <h2 className="page-title">My Booked Flights</h2>
      <div className="flights-grid">
        {flights.map((flight, index) => (
          <div key={index} className="flight-card">
            <div className="airline-header">
              <img src={getAirlineLogo(flight.airline)} alt={flight.airline} className="airline-logo" />
              <div className="flight-number">Flight {flight.flight_number}</div>
            </div>

            <div className="flight-details">
              <div className="route-info">
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

              <button
                className="cancel-flight-button"
                onClick={() => handleCancelFlight(flight)}
              >
                Cancel Flight
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyFlights;
