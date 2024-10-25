import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setFilteredFlights, setErrorMessage } from '../store/flightsSlice';
import { setDepartureAirport, setDestinationAirport, setDepartureDate, setTravelers } from '../store/searchSlice';

function SavedSearches() {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSearch, setActiveSearch] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user?.user_id) {
      navigate('/login');
      return;
    }

    fetchSavedSearches();
  }, [user?.user_id, navigate]);

  const fetchSavedSearches = async () => {
    try {
      const response = await axios.get(`http://localhost:9001/api/saved-searches?user_id=${user.user_id}`);
      setSavedSearches(response.data);
    } catch (err) {
      console.error('Error fetching saved searches:', err);
      setError('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAgain = async (search) => {
    setActiveSearch(search.id);
    try {
      // First, update the search form with the saved search criteria
      dispatch(setDepartureAirport({ value: search.from_airport, label: search.from_airport }));
      dispatch(setDestinationAirport({ value: search.to_airport, label: search.to_airport }));
      dispatch(setDepartureDate(search.departure_date));
      dispatch(setTravelers(search.adults || 1));

      // Execute the search
      const searchCriteria = {
        departureAirport: search.from_airport,
        destinationAirport: search.to_airport,
        departureDate: search.departure_date,
        returnDate: search.return_date,
        numTravellers: search.adults,
        numStops: search.max_stops,
        selectedAirline: search.preferred_airline,
        maxPrice: search.max_price
      };

      const response = await axios.post('http://localhost:9001/api/flights/search', searchCriteria);
      
      if (response.data.departureFlights.length === 0) {
        dispatch(setErrorMessage('No flights found for these criteria.'));
      } else {
        dispatch(setFilteredFlights(response.data.departureFlights));
        dispatch(setErrorMessage(''));
      }

      // Navigate to home page with search results
      navigate('/');
    } catch (err) {
      console.error('Error executing search:', err);
      setError('Failed to execute search');
    } finally {
      setActiveSearch(null);
    }
  };

  const handleDelete = async (searchId) => {
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      try {
        await axios.delete(`http://localhost:9001/api/saved-searches/${searchId}`);
        setSavedSearches(savedSearches.filter(search => search.id !== searchId));
      } catch (err) {
        console.error('Error deleting saved search:', err);
        setError('Failed to delete saved search');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Saved Searches ({savedSearches.length})</h2>
      {savedSearches.length === 0 ? (
        <div className="alert alert-info">
          No saved searches yet. Try saving a search from the home page!
        </div>
      ) : (
        <div className="row">
          {savedSearches.map((search) => (
            <div key={search.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{search.name}</h5>
                  <div className="card-text">
                    <p className="mb-2">
                      <i className="fas fa-plane-departure me-2"></i>
                      <strong>From:</strong> {search.from_airport}
                    </p>
                    <p className="mb-2">
                      <i className="fas fa-plane-arrival me-2"></i>
                      <strong>To:</strong> {search.to_airport}
                    </p>
                    <p className="mb-2">
                      <i className="fas fa-calendar me-2"></i>
                      <strong>Date:</strong> {new Date(search.departure_date).toLocaleDateString()}
                    </p>
                    {search.return_date && (
                      <p className="mb-2">
                        <i className="fas fa-calendar-alt me-2"></i>
                        <strong>Return:</strong> {new Date(search.return_date).toLocaleDateString()}
                      </p>
                    )}
                    <p className="mb-2">
                      <i className="fas fa-users me-2"></i>
                      <strong>Travelers:</strong> {search.adults || 1}
                    </p>
                    {search.max_price && (
                      <p className="mb-2">
                        <i className="fas fa-tag me-2"></i>
                        <strong>Max Price:</strong> ${search.max_price}
                      </p>
                    )}
                    {search.last_minimum_price && (
                      <p className="text-info bg-light p-2 rounded">
                        <i className="fas fa-clock me-2"></i>
                        Last found price: ${search.last_minimum_price}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 d-flex justify-content-between">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSearchAgain(search)}
                      disabled={activeSearch === search.id}
                    >
                      {activeSearch === search.id ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Searching...</>
                      ) : (
                        <><i className="fas fa-search me-2"></i>Search Again</>
                      )}
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleDelete(search.id)}
                      disabled={activeSearch === search.id}
                    >
                      <i className="fas fa-trash me-2"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedSearches;