import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function ThingsToDo() {
  const location = useLocation();
  const { departureAirport } = location.state || {};
  const [places, setPlaces] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractCityName = (airportLabel) => {
    // Handle cases like "Los Angeles International (LAX)"
    const cityName = airportLabel
      .split('(')[0] // Split by opening parenthesis and take first part
      .replace(/\bInternational\b/gi, '') // Remove "International"
      .replace(/\bAirport\b/gi, '') // Remove "Airport"
      .trim(); // Remove extra spaces

    return cityName;
  };

  useEffect(() => {
    let isLoaded = false;
    let googleMapsScript = null;

    const loadGoogleMapsScript = () => {
      // Check if script is already in process of loading
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        return;
      }

      googleMapsScript = document.createElement('script');
      googleMapsScript.id = 'google-maps-script';
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA7hVesv-ePyj9hF1pzy78gQAV2BoI0YZs&libraries=places&callback=Function.prototype`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;

      googleMapsScript.addEventListener('load', () => {
        isLoaded = true;
        fetchPlaces();
      });

      document.body.appendChild(googleMapsScript);
    };

    const fetchPlaces = () => {
      if (!departureAirport?.label || !isLoaded) {
        setLoading(false);
        return;
      }

      try {
        const cityName = extractCityName(departureAirport.label);
        const bounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(0, 0),  // Dummy bounds
          new window.google.maps.LatLng(0, 0)
        );
        
        const center = new window.google.maps.LatLng(0, 0); // Dummy center
        const map = new window.google.maps.Map(document.createElement('div'), {
          center,
          bounds,
          zoom: 15
        });

        const service = new window.google.maps.places.PlacesService(map);

        // Search for bars
        const barRequest = {
          query: `bars in ${cityName}`,
          bounds: bounds
        };

        service.textSearch(barRequest, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            // Transform the data and limit to 5 results
            const transformedPlaces = results.slice(0, 5).map(place => ({
              displayName: { text: place.name },
              formattedAddress: place.formatted_address,
              rating: place.rating,
              userRatingCount: place.user_ratings_total,
              editorialSummary: { text: place.editorial_summary?.overview },
              photos: place.photos ? [{ 
                reference: place.photos[0].photo_reference 
              }] : [],
              regularOpeningHours: {
                openNow: place.opening_hours?.open_now
              }
            }));

            setPlaces(transformedPlaces);
          } else {
            setError('No bar results found');
          }
          setLoading(false);
        });

        // Search for restaurants
        const restaurantRequest = {
          query: `restaurants in ${cityName}`,
          bounds: bounds
        };

        service.textSearch(restaurantRequest, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const transformedRestaurants = results.slice(0, 5).map(place => ({
              name: place.name,
              formattedAddress: place.formatted_address,
              rating: place.rating,
              userRatingCount: place.user_ratings_total,
              photos: place.photos ? [{ 
                reference: place.photos[0].photo_reference 
              }] : [],
              openNow: place.opening_hours?.open_now,
            }));
            setRestaurants(transformedRestaurants);
          } else {
            setError('No restaurant results found');
          }
        });

      } catch (err) {
        console.error('Error fetching places:', err);
        setError(`Failed to load places: ${err.message}`);
        setLoading(false);
      }
    };

    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      fetchPlaces();
    }

    return () => {
      // Cleanup on unmount
      if (googleMapsScript) {
        googleMapsScript.remove();
      }
    };
  }, [departureAirport]);

  if (!departureAirport) {
    return null;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Bars in {extractCityName(departureAirport.label)}</h1>
      
      {places.length > 0 ? (
        <div className="row g-4">
          {places.map((place, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div className="card h-100">
                {place.photos?.[0]?.reference && (
                  <img 
                    src={`http://localhost:9001/api/places/photo?photo_reference=${place.photos[0].reference}&maxwidth=400`}
                    className="card-img-top"
                    alt={place.displayName?.text}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{place.displayName?.text}</h5>
                  <p className="card-text text-muted">
                    <small>{place.formattedAddress}</small>
                  </p>
                  {place.editorialSummary?.text && (
                    <p className="card-text">{place.editorialSummary.text}</p>
                  )}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="rating">
                      <span className="badge bg-primary">
                        ⭐ {place.rating} ({place.userRatingCount} reviews)
                      </span>
                    </div>
                    {place.regularOpeningHours?.openNow !== undefined && (
                      <span className={`badge ${place.regularOpeningHours.openNow ? 'bg-success' : 'bg-danger'}`}>
                        {place.regularOpeningHours.openNow ? 'Open' : 'Closed'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info" role="alert">
          No bars found in this location.
        </div>
      )}

      <h1 className="mb-4">Restaurants in {extractCityName(departureAirport.label)}</h1>
      {restaurants.length > 0 ? (
        <div className="row g-4">
          {restaurants.map((place, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div className="card h-100">
                {place.photos?.[0]?.reference && (
                  <img 
                    src={`http://localhost:9001/api/places/photo?photo_reference=${place.photos[0].reference}&maxwidth=400`}
                    className="card-img-top"
                    alt={place.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{place.name}</h5>
                  <p className="card-text text-muted">
                    <small>{place.formattedAddress}</small>
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="rating">
                      <span className="badge bg-primary">
                        ⭐ {place.rating} ({place.userRatingCount} reviews)
                      </span>
                    </div>
                    {place.openNow !== undefined && (
                      <span className={`badge ${place.openNow ? 'bg-success' : 'bg-danger'}`}>
                        {place.openNow ? 'Open' : 'Closed'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info" role="alert">
          No restaurants found in this location.
        </div>
      )}
    </div>
  );
}

export default ThingsToDo;