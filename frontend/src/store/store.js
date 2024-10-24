import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import searchReducer from './searchSlice';
import flightsReducer from './flightsSlice';
import savedSearchesReducer from './savedSearchesSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    search: searchReducer,
    flights: flightsReducer,
    savedSearches: savedSearchesReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;