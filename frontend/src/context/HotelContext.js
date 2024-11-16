// src/context/HotelContext.js
import React, { createContext, useContext, useState } from 'react';

// Create a context for hotel-related state
const HotelContext = createContext();

// Provider component to wrap your app and provide the context value
export const HotelProvider = ({ children }) => {
  const [totalHotelPrice, setTotalHotelPrice] = useState(0);

  return (
    <HotelContext.Provider value={{ totalHotelPrice, setTotalHotelPrice }}>
      {children}
    </HotelContext.Provider>
  );
};

// Custom hook to use hotel context in other components
export const useHotelContext = () => {
  return useContext(HotelContext);
};
