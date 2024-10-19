import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    departureAirport: null,
    destinationAirport: null,
    departureDate: '',
    travelers: 1,
  },
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
  },
});

export const { setDepartureAirport, setDestinationAirport, setDepartureDate, setTravelers } = searchSlice.actions;
export default searchSlice.reducer;
