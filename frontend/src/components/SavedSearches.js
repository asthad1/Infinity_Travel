import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlaneDeparture, 
  faPlaneArrival, 
  faClock, 
  faDollarSign,
  faTag,
  faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';
import './SavedSearches.css';

const airlineImages = {
  'Air France': require('../assets/images/airlines/air-france.jpg'),
  'American Airlines': require('../assets/images/airlines/american-airlines.png'),
  'British Airways': require('../assets/images/airlines/british.png'),
  'Cathay Pacific': require('../assets/images/airlines/cathay.jpg'),
  'Delta Airlines': require('../assets/images/airlines/delta.png'),
  'Emirates': require('../assets/images/airlines/emirates.png'),
  'Lufthansa': require('../assets/images/airlines/lufthansa.png'),
  'Qatar Airways': require('../assets/images/airlines/qatar.jpg'),
  'Singapore Airlines': require('../assets/images/airlines/singapore.png'),
  'United Airlines': require('../assets/images/airlines/united.png'),
  'default': require('../assets/images/airlines/default-logo.png')
};

function SavedSearches() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.user_id) {
      console.log('No user found, redirecting to login...');
      navigate('/login');
    } else {
      fetchFavorites();
    }
  }, [user?.user_id, navigate]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`http://localhost:9001/api/favorites/${user.user_id}`);
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAirlineLogo = (airline) => {
    return airlineImages[airline] || airlineImages.default;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading favorites...</span>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="empty-favorites">
        <FontAwesomeIcon icon={faPlaneDeparture} className="empty-icon" />
        <h3>No Favorite Flights</h3>
        <p className="text-muted">Start adding flights to your favorites!</p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h2 className="page-title">My Saved Flights</h2>
      <div className="favorites-grid">
        {favorites.map((favorite, index) => (
          <div key={index} className="favorite-card">
            <div className="card-header">
              <img 
                src={getAirlineLogo(favorite.airline)} 
                alt={favorite.airline}
                className="airline-logo"
              />
              <span className="flight-number">{favorite.flight_number || 'N/A'}</span>
            </div>

            <div className="card-content">
              <div className="label-container">
                <FontAwesomeIcon icon={faTag} className="icon" />
                <span className="label">{favorite.label || 'No Label'}</span>
              </div>

              <h5>From: </h5>
              <div className="flight-route">
                <div className="departure">
                  <FontAwesomeIcon icon={faPlaneDeparture} className="icon" />
                  <div className="route-details">
                    <div className="airport">{favorite.departure_airport}</div>
                    <div className="time">{formatDateTime(favorite.departure_time)}</div>
                  </div>
                </div>

                <div className="route-divider">
                  <div className="line"></div>
                  {favorite.stops === 0 ? (
                    <span className="stops">Non-stop</span>
                  ) : (
                    <span className="stops">{favorite.stops} stop(s)</span>
                  )}
                </div>

                <h5>To: </h5>
                <div className="arrival">
                  <FontAwesomeIcon icon={faPlaneArrival} className="icon" />
                  <div className="route-details">
                    <div className="airport">{favorite.destination_airport}</div>
                    <div className="time">{formatDateTime(favorite.arrival_time)}</div>
                  </div>
                </div>
              </div>

              <div className="price-container">
                <FontAwesomeIcon icon={faDollarSign} className="icon" />
                <span className="price">${favorite.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedSearches;