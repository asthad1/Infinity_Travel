import React from 'react';

const SavedFlights = () => {
  const savedFlights = [
    {
      date: 'Nov 8',
      airline: 'Z',
      departureTime: '9:30 am',
      departureAirport: 'LAX',
      arrivalTime: '2:25 pm',
      arrivalAirport: 'NRT',
      price: 208,
      provider: 'Orbitz',
      class: 'Economy',
      carryOn: 1,
      checkedBags: 0
    },
    {
      date: 'Nov 8',
      airline: 'D',
      departureTime: '10:00 am',
      departureAirport: 'LAX',
      arrivalTime: '3:05 pm',
      arrivalAirport: 'HND',
      price: 539,
      provider: 'Delta',
      class: 'Economy',
      carryOn: 1,
      checkedBags: 1
    },
    {
      date: 'Nov 8',
      airline: 'E',
      departureTime: '9:03 am',
      departureAirport: 'LAX',
      arrivalTime: '7:55 pm',
      arrivalAirport: 'NRT',
      price: 371,
      provider: 'Kiwi.com',
      class: 'Economy',
      carryOn: 0,
      checkedBags: 0,
      stops: [{ airport: 'SFO', duration: '17h 52m' }]
    }
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Saved</h1>
        <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>+</button>
      </div>
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
        <p>♥3 saved flights</p>
        {savedFlights.map((flight, index) => (
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
                <div>{flight.departureTime}{flight.departureAirport}</div>
              </div>
              {flight.stops && (
                <div style={{ textAlign: 'center' }}>
                  <div>{flight.stops[0].airport}</div>
                  <div>{flight.stops[0].duration}</div>
                </div>
              )}
              <div>{flight.arrivalTime}{flight.arrivalAirport}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#1a73e8', fontWeight: 'bold', fontSize: '1.2em' }}>${flight.price}</div>
                <div>{flight.provider}{flight.class}</div>
                <button style={{ backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>
                  View Deal
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedFlights;