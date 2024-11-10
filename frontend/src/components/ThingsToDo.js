import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function ThingsToDo() {
  const location = useLocation();
  const { departureAirport } = location.state || {};

  if (!departureAirport) {
    return null; // Do not display anything if departureAirport is null
  }

  const [activities, setActivities] = useState({
    kids: [],
    history: [],
    adventure: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractLocationInfo = (airportLabel) => {
    // Handle cases like "Los Angeles International (LAX)"
    const cityName = airportLabel
      .split('(')[0] // Split by opening parenthesis and take first part
      .replace(/\bInternational\b/gi, '') // Remove "International"
      .replace(/\bAirport\b/gi, '') // Remove "Airport"
      .trim(); // Remove extra spaces

    // Map cities to their countries - expand this map as needed
    const cityToCountry = {
      'Los Angeles': 'United States',
      'New York': 'United States',
      'London': 'United Kingdom',
      'Paris': 'France',
      // Add more mappings as needed
    };

    const country = cityToCountry[cityName] || 'Unknown Country';
    return { city: cityName, country };
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const apiKey = 'd5af62e8a7msh29814d697f1a42ap11e339jsn1928849f1bb8';
        const cityName = extractLocationInfo(departureAirport.label).city;
        console.log('Searching for activities in:', cityName);

        // Use the correct endpoint to search for location
        const locationResponse = await fetch(
          `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchRestaurants?locationId=32655`, // Hard-coded LA location ID
          {
            headers: {
              'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com',
              'x-rapidapi-key': apiKey
            }
          }
        );
        
        if (!locationResponse.ok) {
          throw new Error(`Location API error: ${locationResponse.status}`);
        }

        const locationData = await locationResponse.json();
        console.log('Location data:', locationData); // Debug log

        // Categories for Los Angeles
        const categories = {
          kids: {
            locationId: '32655',
            tag: 'family-friendly'
          },
          history: {
            locationId: '32655',
            tag: 'historical'
          },
          adventure: {
            locationId: '32655',
            tag: 'attractions'
          }
        };

        const fetchCategory = async (categoryInfo) => {
          const response = await fetch(
            `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchRestaurants?locationId=${categoryInfo.locationId}&category=${categoryInfo.tag}`,
            {
              headers: {
                'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com',
                'x-rapidapi-key': apiKey
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`Category API error: ${response.status}`);
          }
          
          const data = await response.json();
          return data?.data?.data || [];
        };

        // Fetch all categories
        const [kidsData, historyData, adventureData] = await Promise.all([
          fetchCategory(categories.kids),
          fetchCategory(categories.history),
          fetchCategory(categories.adventure)
        ]);

        setActivities({
          kids: kidsData,
          history: historyData,
          adventure: adventureData
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(`Failed to load activities: ${err.message}`);
        setLoading(false);
      }
    };

    if (departureAirport?.label) {
      fetchActivities();
    }
  }, [departureAirport]);

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

  const renderActivityList = (items, category) => (
    <div className="card mb-4">
      <div className="card-header">
        <h3>{category}</h3>
      </div>
      <ul className="list-group list-group-flush">
        {items.map((item) => (
          <li key={item.restaurantsId || item.locationId} className="list-group-item">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="mb-1">{item.name}</h5>
                {item.establishmentTypeAndCuisineTags && (
                  <p className="mb-1 text-muted">
                    {item.establishmentTypeAndCuisineTags.join(' • ')}
                  </p>
                )}
              </div>
              <span className="badge bg-primary rounded-pill">
                Rating: {item.averageRating || 'N/A'}
                {item.userReviewCount && ` (${item.userReviewCount} reviews)`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">
        Things to do in {extractLocationInfo(departureAirport.label).city} ({extractLocationInfo(departureAirport.label).country})
      </h1>
      
      {renderActivityList(activities.kids, 'For Kids')}
      {renderActivityList(activities.history, 'History')}
      {renderActivityList(activities.adventure, 'Adventure')}

      {Object.values(activities).every(arr => arr.length === 0) && (
        <div className="alert alert-info" role="alert">
          No activities found for this location.
        </div>
      )}
    </div>
  );
}

export default ThingsToDo;