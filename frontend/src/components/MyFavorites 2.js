import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get and parse the user object from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.user_id) {
      console.log('No user found, redirecting to login...');
      navigate('/login');  // Redirect to login if user is not available
    } else {
      const fetchFavorites = async () => {
        try {
          const response = await axios.get(`http://localhost:9001/api/favorites/${user.user_id}`);
          console.log('Favorites response:', response.data);
          setFavorites(response.data);
        } catch (error) {
          console.error('Error fetching favorites:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchFavorites();
    }
  }, [user?.user_id, navigate]);

  if (loading) {
    return <div className="spinner-border text-primary" role="status">
      <span className="sr-only">Loading favorites...</span>
    </div>;
  }

  if (favorites.length === 0) {
    return <p className="text-muted text-center mt-5">You have no favorite flights saved.</p>;
  }

  return (
    <div className="my-favorites container">
      <h2 className="text-center my-4">My Favorite Flights</h2>
      <div className="row">
        {favorites.map((favorite, index) => (
          <div key={index} className="col-md-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title text-primary">Flight: {favorite.flight_number || 'N/A'}</h5>
                <p className="text-muted">Label: {favorite.label || 'No Label'}</p> 
                <p className="mb-2"><i className="fas fa-plane"></i> Airline: {favorite.airline}</p>
                <p><i className="fas fa-map-marker-alt"></i> Departure: {favorite.departure_airport} at {new Date(favorite.departure_time).toLocaleString()}</p>
                <p><i className="fas fa-map-marker-alt"></i> Arrival: {favorite.destination_airport} at {new Date(favorite.arrival_time).toLocaleString()}</p>
                <p><i className="fas fa-dollar-sign"></i> Price: ${favorite.price}</p>
                <p><i className="fas fa-exchange-alt"></i> Stops: {favorite.stops === 0 ? 'Non-stop' : favorite.stops}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyFavorites;
