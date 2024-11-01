import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setFilteredFlights, setErrorMessage } from '../store/flightsSlice';
import { setDepartureAirport, setDestinationAirport, setDepartureDate, setTravelers } from '../store/searchSlice';
import { Modal, Button } from 'react-bootstrap';
import { FaPlane, FaHeart, FaShareAlt, FaClock, FaExchangeAlt } from 'react-icons/fa';
import './MyFavorites.css';

function SavedSearches() {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSearch, setActiveSearch] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

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
      dispatch(setDepartureAirport({ value: search.from_airport, label: search.from_airport }));
      dispatch(setDestinationAirport({ value: search.to_airport, label: search.to_airport }));
      dispatch(setDepartureDate(search.departure_date));
      dispatch(setTravelers(search.adults || 1));

      const searchCriteria = {
        departureAirport: search.from_airport,
        destinationAirport: search.to_airport,
        departureDate: search.departure_date,
        returnDate: search.return_date,
        numTravellers: search.adults,
        numStops: search.max_stops,
        selectedAirline: search.preferred_airline,
        maxPrice: search.max_price,
      };

      const response = await axios.post('http://localhost:9001/api/flights/search', searchCriteria);

      if (response.data.departureFlights.length === 0) {
        dispatch(setErrorMessage('No flights found for these criteria.'));
      } else {
        dispatch(setFilteredFlights(response.data.departureFlights));
        dispatch(setErrorMessage(''));
      }

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
        setSavedSearches(savedSearches.filter((search) => search.id !== searchId));
      } catch (err) {
        console.error('Error deleting saved search:', err);
        setError('Failed to delete saved search');
      }
    }
  };

  const handleShare = (flight) => {
    setSelectedFlight(flight);
    const uniqueURL = `http://localhost:3000/shared-flights/${flight.id}`;
    setShareLink(uniqueURL);
    setShareModal(true);
  };

  const handleShareModalClose = () => setShareModal(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  // Group saved searches by country and city
  const groupedSearches = savedSearches.reduce((acc, search) => {
    const country = search.to_country || "Unknown Country";
    const city = search.to_city || "Unknown City";
    if (!acc[country]) acc[country] = {};
    if (!acc[country][city]) acc[country][city] = [];
    acc[country][city].push(search);
    return acc;
  }, {});

  const countryCodeMap = {
    'United States': 'us',
    'Brazil': 'br',
    'Canada': 'ca',
    'United Kingdom': 'gb',
    'Australia': 'au',
    'Germany': 'de',
    'France': 'fr',
    'Italy': 'it',
    'Mexico': 'mx',
    'Japan': 'jp',
    'China': 'cn',
    'India': 'in',
    'South Korea': 'kr',
    'Russia': 'ru',
    'Netherlands': 'nl',
    'Spain': 'es',
    'Switzerland': 'ch',
    'Sweden': 'se',
    'Norway': 'no',
    'Denmark': 'dk',
    'Finland': 'fi',
    'New Zealand': 'nz',
    'South Africa': 'za',
    'Argentina': 'ar',
    'Chile': 'cl',
    'Colombia': 'co',
    'Turkey': 'tr',
    'Saudi Arabia': 'sa',
    'United Arab Emirates': 'ae',
    'Israel': 'il',
    'Egypt': 'eg',
    'Nigeria': 'ng',
    'Pakistan': 'pk',
    'Bangladesh': 'bd',
    'Vietnam': 'vn',
    'Philippines': 'ph',
    'Thailand': 'th',
    'Indonesia': 'id',
    'Malaysia': 'my',
    'Singapore': 'sg',
    'Hong Kong': 'hk'
    // Add additional countries as needed
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Favorites ({savedSearches.length})</h2>
      {savedSearches.length === 0 ? (
        <div className="alert alert-info">
          No saved searches yet. Try saving a search from the home page!
        </div>
      ) : (
        Object.entries(groupedSearches).map(([country, cities]) => (
          <div key={country} className="country-section mb-4 p-3 rounded shadow-sm">
            <h3 className="mb-2">Destination</h3>
            <div className="country-header mb-2">
              <img
                src={`https://flagcdn.com/48x36/${countryCodeMap[country] || country.slice(0, 2).toLowerCase()}.png`}
                alt={`${country} flag`}
                className="country-flag"
              />
              <h3 className="country-name">{country}</h3>
            </div>
            {Object.entries(cities).map(([city, searches]) => (
              <div key={city} className="city-section mb-3">
                <h4>{city}</h4>
                <div className="searches-container row">
                  {searches.map((search) => (
                    <div key={search.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <h5 className="card-title">{search.name}</h5>
                          <p><strong>From:</strong> {search.from_airport}</p>
                          <p><strong>To:</strong> {search.to_airport}</p>
                          <p><strong>Date:</strong> {new Date(search.departure_date).toLocaleDateString()}</p>
                          {search.return_date && (
                            <p><strong>Return:</strong> {new Date(search.return_date).toLocaleDateString()}</p>
                          )}
                          <p><strong>Travelers:</strong> {search.adults || 1}</p>
                          {search.max_price && <p><strong>Max Price:</strong> ${search.max_price}</p>}
                          {search.last_minimum_price && (
                            <p className="text-info bg-light p-2 rounded">
                              Last found price: ${search.last_minimum_price}
                            </p>
                          )}
                          <div className="mt-3 d-flex justify-content-between">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleSearchAgain(search)}
                              disabled={activeSearch === search.id}
                            >
                              {activeSearch === search.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>Searching...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-search me-2"></i>Search Again
                                </>
                              )}
                            </button>
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleShare(search)}
                            >
                              <FaShareAlt /> Share
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
              </div>
            ))}
          </div>
        ))
      )}

      {/* Share Modal */}
      <Modal show={shareModal} onHide={handleShareModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Share Flight</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Share this flight search via the link below:</p>
          <input type="text" value={shareLink} readOnly className="form-control mb-3" />
          <Button variant="primary" onClick={handleCopyLink}>Copy Link</Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleShareModalClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SavedSearches;