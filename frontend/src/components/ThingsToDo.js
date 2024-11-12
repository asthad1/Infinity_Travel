import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function ThingsToDo() {
  const location = useLocation();
  const { departureAirport } = location.state || {};
  const [places, setPlaces] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractAirportCode = (airportLabel) => {
    // Extract code from format like "John F. Kennedy International (JFK)"
    const match = airportLabel.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : airportLabel;
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google) {
          resolve(window.google);
          return;
        }

        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.google));
          return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA7hVesv-ePyj9hF1pzy78gQAV2BoI0YZs&libraries=places`;
        script.async = true;
        script.defer = true;

        script.addEventListener('load', () => resolve(window.google));
        script.addEventListener('error', (e) => reject(e));

        document.body.appendChild(script);
      });
    };

    const searchPlaces = async () => {
      if (!departureAirport?.label) {
        setLoading(false);
        return;
      }

      try {
        const google = await loadGoogleMapsScript();
        
        if (!mounted) return;

        const airportCode = extractAirportCode(departureAirport.label);
        const geocoder = new google.maps.Geocoder();

        // First, geocode the airport to get its location
        const geocodeResult = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: `${airportCode} airport` }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
              resolve(results[0].geometry.location);
            } else {
              reject(new Error('Could not find airport location'));
            }
          });
        });

        const location = geocodeResult;
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(
            location.lat() - 0.1,
            location.lng() - 0.1
          ),
          new google.maps.LatLng(
            location.lat() + 0.1,
            location.lng() + 0.1
          )
        );

        const map = new google.maps.Map(document.createElement('div'), {
          center: location,
          bounds: bounds,
          zoom: 15
        });

        const service = new google.maps.places.PlacesService(map);

        // Search for bars and restaurants in parallel
        const [barResults, restaurantResults] = await Promise.all([
          new Promise((resolve) => {
            service.textSearch({
              query: `bars near ${airportCode} airport`,
              location: location,
              radius: 5000
            }, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
              } else {
                resolve([]);
              }
            });
          }),
          new Promise((resolve) => {
            service.textSearch({
              query: `restaurants near ${airportCode} airport`,
              location: location,
              radius: 5000
            }, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
              } else {
                resolve([]);
              }
            });
          })
        ]);

        if (!mounted) return;

        // Transform and set results
        if (barResults.length > 0) {
          setPlaces(barResults.slice(0, 5).map(place => ({
            displayName: { text: place.name },
            formattedAddress: place.formatted_address,
            rating: place.rating,
            userRatingCount: place.user_ratings_total,
            editorialSummary: { text: place.editorial_summary?.overview },
            photos: place.photos ? [{ reference: place.photos[0].photo_reference }] : [],
            regularOpeningHours: { openNow: place.opening_hours?.open_now }
          })));
        }

        if (restaurantResults.length > 0) {
          setRestaurants(restaurantResults.slice(0, 5).map(place => ({
            name: place.name,
            formattedAddress: place.formatted_address,
            rating: place.rating,
            userRatingCount: place.user_ratings_total,
            photos: place.photos ? [{ reference: place.photos[0].photo_reference }] : [],
            openNow: place.opening_hours?.open_now,
          })));
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching places:', err);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(searchPlaces, 1000); // Retry after 1 second
        } else {
          setError(`Failed to load places: ${err.message}`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    searchPlaces();

    return () => {
      mounted = false;
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
      <h1 className="mb-4">Bars near {departureAirport.label}</h1>
      
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

      <h1 className="mb-4">Restaurants near {departureAirport.label}</h1>
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