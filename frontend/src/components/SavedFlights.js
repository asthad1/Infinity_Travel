import React, { useState, useEffect } from 'react';

const SavedFlights = ({ savedFlights }) => {
  // Dynamic saved flights from props, which can be passed from the parent (e.g., from local storage or a state)
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Saved Flights</h1>
      </div>
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
        <p>♥ {savedFlights.length} saved flights</p>
        {savedFlights.length > 0 ? savedFlights.map((flight, index) => (
          <div key={index} style={{ borderTop: index !== 0 ? '1px solid #eee' : 'none', paddingTop: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>{flight.date}</span>
              <span>
                💼 {flight.carryOn} 🧳 {flight.checkedBags}
              </span>
              <span>...</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div>{flight.airline}</div>
                <div>{flight.departureTime} {flight.departureAirport}</div>
              </div>
              {flight.stops && (
                <div style={{ textAlign: 'center' }}>
                  <div>{flight.stops[0].airport}</div>
                  <div>{flight.stops[0].duration}</div>
                </div>
              )}
              <div>{flight.arrivalTime} {flight.arrivalAirport}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#1a73e8', fontWeight: 'bold', fontSize: '1.2em' }}>${flight.price}</div>
                <div>{flight.provider} {flight.class}</div>
                <button style={{ backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>
                  View Deal
                </button>
              </div>
            </div>
          </div>
        )) : (
          <p>No saved flights yet.</p>
        )}
      </div>
    </div>
  );
};

export default SavedFlights;
