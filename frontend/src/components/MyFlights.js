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
import { useDispatch, useSelector } from 'react-redux';
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
  'default': require('../assets/images/airlines/default-logo.png')
};

function MyFlights() {
  const [flights, setFlights] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const user_id = useSelector((state) => state.user.user_id);
  const { setTotalFlightPrice } = useFlightContext();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        if (user_id) {
          const response = await axios.get('http://localhost:9001/api/booked_flights', {
            params: { user_id },
          });

          const confirmedFlights = response.data.filter((flight) => flight.status === 'confirmed');
          setFlights(confirmedFlights);
        }
      } catch (error) {
        console.error('Error fetching booked flights:', error);
      }
    };

    fetchFlights();
  }, [user_id]);

  useEffect(() => {
    const total = flights.reduce((total, flight) => total + parseFloat(flight.total_price), 0);
    setTotalFlightPrice(Math.round(total));
  }, [flights, setTotalFlightPrice]);

  const getAirlineLogo = (airline) => airlineImages[airline] || airlineImages.default;

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleCancelFlight = async (flight) => {
    const now = new Date();
    const departureTime = new Date(flight.departure_time);

    const timeDifference = (departureTime - now) / (1000 * 60 * 60); // Difference in hours

    let refundPercentage = 0;
    let refundMessage = '';
    let messageType = 'success'; // Default message type

    if (timeDifference > 4) {
      refundPercentage = 1; // Full refund
      refundMessage = `You have received a full refund of $${(flight.total_price * refundPercentage).toFixed(
        2
      )} as travel credit.`;
    } else if (timeDifference >= 2 && timeDifference <= 4) {
      refundPercentage = 0.5; // 50% refund
      refundMessage = `You have received a 50% refund of $${(flight.total_price * refundPercentage).toFixed(
        2
      )} as travel credit.`;
    } else {
      refundPercentage = 0; // No refund
      refundMessage = `You have received no refund for this cancellation as it is less than 2 hours to departure.`;
      messageType = 'error'; // Set message type to error for red notification
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

      // Update travel credit in the backend only if refundAmount > 0
      if (refundAmount > 0) {
        await axios.post('http://localhost:9001/api/travel_credit', {
          user_id,
          credit_change: refundAmount,
        });

        // Dispatch Redux action to update travel credit
        dispatch(updateTravelCredit(refundAmount));
      }

      // Update flight list and display message
      setFlights((prevFlights) => prevFlights.filter((f) => f.id !== flight.id));
      setMessage(`Flight ${flight.flight_number} has been canceled. ${refundMessage}`);
      setMessageType(messageType); // Update the message type state
    } catch (error) {
      console.error('Error canceling flight or updating travel credit:', error);
      setMessage('An error occurred while canceling the flight. Please try again.');
      setMessageType('error'); // Set message type to error
    }
  };

  return (
    <div className="my-flights-container">
      {message && (
        <div className={`flight-notification-banner ${messageType === 'error' ? 'error' : ''}`}>
          {message}
        </div>
      )}
      {flights.length === 0 ? (
        <div className="empty-flights-container">
          <div className="empty-flights-content">
            <FontAwesomeIcon icon={faPlaneDeparture} className="empty-icon" />
            <h2>No Flights Booked Yet</h2>
            <p>Your booked flights will appear here once you make a reservation.</p>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default MyFlights;
