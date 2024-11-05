import React, { createContext, useState, useContext } from 'react';

const FlightContext = createContext();

export const FlightProvider = ({ children }) => {
  const [totalFlightPrice, setTotalFlightPrice] = useState(0);

  const setRoundedPrice = (price) => {
    setTotalFlightPrice(Math.round(price));
  };

  return (
    <FlightContext.Provider value={{ totalFlightPrice, setTotalFlightPrice: setRoundedPrice }}>
      {children}
    </FlightContext.Provider>
  );
};

export const useFlightContext = () => useContext(FlightContext);
