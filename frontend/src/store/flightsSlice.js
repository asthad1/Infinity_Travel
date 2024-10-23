import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch flights from the backend API
export const fetchFlights = createAsyncThunk('flights/fetchFlights', async (_, thunkAPI) => {
  try {
    const response = await axios.get('http://localhost:9001/api/flights'); // Fetch flights from API
    return response.data; // Assuming the API returns an array of flight objects
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to fetch flights');
  }
});

export const flightsSlice = createSlice({
  name: 'flights',
  initialState: {
    flights: [], // Initialize empty flights array
    filteredFlights: [],
    savedFlights: [],
    errorMessage: '',
    loading: false, // Add loading state
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlights.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(fetchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.flights = action.payload;
        state.filteredFlights = action.payload; // Set filteredFlights to all flights initially
      })
      .addCase(fetchFlights.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload;
      });
  },
});

export const { setFilteredFlights, setErrorMessage, saveFlight } = flightsSlice.actions;
export default flightsSlice.reducer;
