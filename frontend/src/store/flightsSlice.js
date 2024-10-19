// flightsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { flights } from '../data/flights'; // Import the data

export const flightsSlice = createSlice({
  name: 'flights',
  initialState: {
    flights: flights, // Initialize with imported flights data
    filteredFlights: [],
    savedFlights: [], // State to store saved flights
    errorMessage: ''
  },
  reducers: {
    setFilteredFlights: (state, action) => {
      state.filteredFlights = action.payload;
    },
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    saveFlight: (state, action) => {
      state.savedFlights.push(action.payload); // Add the flight to savedFlights
    }
  },
});

export const { setFilteredFlights, setErrorMessage, saveFlight } = flightsSlice.actions;
export default flightsSlice.reducer;
