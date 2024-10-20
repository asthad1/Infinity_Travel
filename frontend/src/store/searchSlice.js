import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  departureAirport: null,
  destinationAirport: null,
  departureDate: '',
  travelers: 1,
  numStops: '',
  selectedAirline: '',
  maxPrice: '',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setDepartureAirport: (state, action) => {
      state.departureAirport = action.payload;
    },
    setDestinationAirport: (state, action) => {
      state.destinationAirport = action.payload;
    },
    setDepartureDate: (state, action) => {
      state.departureDate = action.payload;
    },
    setTravelers: (state, action) => {
      state.travelers = action.payload;
    },
    setNumStops: (state, action) => {
      state.numStops = action.payload;
    },
    setSelectedAirline: (state, action) => {
      state.selectedAirline = action.payload;
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload;
    },
    resetSearch: () => initialState,
  },
});

export const {
  setDepartureAirport,
  setDestinationAirport,
  setDepartureDate,
  setTravelers,
  setNumStops,
  setSelectedAirline,
  setMaxPrice,
  resetSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
