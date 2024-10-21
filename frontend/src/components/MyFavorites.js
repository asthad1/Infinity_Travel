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
    // Only add user.user_id and navigate to the dependency array
  }, [user?.user_id, navigate]);

  if (loading) {
    return <p>Loading favorites...</p>;
  }

  if (favorites.length === 0) {
    return <p>You have no favorite flights saved.</p>;
  }

  return (
    <div className="my-favorites">
      <h2>My Favorite Flights</h2>
      {favorites.map((favorite, index) => (
        <div key={index} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Flight: {favorite.flight_number || 'N/A'}</h5>
            <p className="card-text">Label: {favorite.label || 'No Label'}</p> {/* Display custom label */}
            <p className="card-text">Airline: {favorite.airline}</p>
            <p className="card-text">
              Departure: {favorite.departure_airport} at {new Date(favorite.departure_time).toLocaleString()}
            </p>
            <p className="card-text">
              Arrival: {favorite.destination_airport} at {new Date(favorite.arrival_time).toLocaleString()}
            </p>
            <p className="card-text">Price: ${favorite.price}</p>
            <p className="card-text">Stops: {favorite.stops === 0 ? 'Non-stop' : favorite.stops}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyFavorites;
