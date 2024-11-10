import React from 'react';
import { useLocation } from 'react-router-dom';

function ThingsToDo() {
  const location = useLocation();
  const { departureAirport } = location.state || {};

  return (
    <div>
      <h1>Things to do in {departureAirport.label}</h1>
      {/* Add content to display things to do */}
    </div>
  );
}

export default ThingsToDo;