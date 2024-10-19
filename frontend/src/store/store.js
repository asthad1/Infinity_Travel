// store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import searchReducer from './searchSlice';
import flightsReducer from './flightsSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    search: searchReducer,
    flights: flightsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production', // Enable devTools only for non-production environments
});

export default store;
