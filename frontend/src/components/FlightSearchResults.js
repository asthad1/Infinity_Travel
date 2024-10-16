import React, { useState, useEffect } from 'react';
import './FlightSearchResults.css'; // Make sure the CSS is imported

const FlightSearchResults = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a data fetch with hardcoded dummy flight data
    const dummyFlightData = [
      {
        airline: 'ZIPAIR',
        logoUrl: 'https://example.com/logos/zipair.png',
        departureTime: '9:30 am',
        arrivalTime: '2:25 pm',
        duration: '11h 55m',
        departureAirport: 'LAX',
        arrivalAirport: 'NRT',
        price: 208,
        pricePerMonth: 19
      },
      {
        airline: 'ANA',
        logoUrl: 'https://example.com/logos/ana.png',
        departureTime: '3:45 pm',
        arrivalTime: '9:10 pm',
        duration: '12h 25m',
        departureAirport: 'LAX',
        arrivalAirport: 'HND',
        price: 565,
        pricePerMonth: 48
      },
      {
        airline: 'ANA',
        logoUrl: 'https://example.com/logos/ana.png',
        departureTime: '11:30 am',
        arrivalTime: '4:30 pm',
        duration: '12h 00m',
        departureAirport: 'LAX',
        arrivalAirport: 'NRT',
        price: 565,
        pricePerMonth: 48
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setFlights(dummyFlightData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flight-search-results">
      <div className="sort-options">
        <div className="sort-option active">Best <strong>$208 • 11h 55m</strong></div>
        <div className="sort-option">Cheapest <strong>$208 • 11h 55m</strong></div>
        <div className="sort-option">Quickest <strong>$591 • 11h 45m</strong></div>
        <div className="sort-option">Other sort</div>
      </div>

      {flights.map((flight, index) => (
        <div className="flight-card" key={index}>
          <div className="flight-tags">
            <span className="tag best">Best</span>
            <span className="tag cheapest">Cheapest</span>
          </div>
          <div className="flight-details">
            <div className="airline-logo">
              <img src={flight.logoUrl} alt={flight.airline} />
            </div>
            <div className="flight-info">
              <div className="flight-time">
                {flight.departureTime} – {flight.arrivalTime}
              </div>
              <div className="flight-duration">nonstop • {flight.duration}</div>
              <div className="flight-route">{flight.departureAirport} – {flight.arrivalAirport}</div>
            </div>
            <div className="flight-price-section">
              <div className="price">${flight.price}</div>
              <div className="price-subtitle">As low as ${flight.pricePerMonth}/mo</div>
              <button className="view-deal-button">View Deal</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightSearchResults;
