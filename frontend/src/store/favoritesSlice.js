import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial state for favorites
const initialState = {
  favorites: [],
  error: null,
};

// Create favorites slice
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavoriteSuccess: (state, action) => {
      state.favorites.push(action.payload); // Add the new favorite to the list
    },
    setFavoriteError: (state, action) => {
      state.error = action.payload;  // Set error message in the state
    },
    clearFavoriteError: (state) => {
      state.error = null;  // Clear any existing errors
    }
  },
});

export const { addFavoriteSuccess, setFavoriteError, clearFavoriteError } = favoritesSlice.actions;
export default favoritesSlice.reducer;

// Thunk to save a favorite to the backend
export const saveFavorite = (favoriteData) => async (dispatch) => {
  try {
    // Clear any previous errors before saving
    dispatch(clearFavoriteError());

    // Send the favorite data to the backend
    const response = await axios.post('http://localhost:9001/api/favorites', favoriteData);

    // Dispatch the success action with the saved favorite data
    dispatch(addFavoriteSuccess(response.data));

    // Optionally, you can show a success message or handle this with a toast/notification
    alert('Flight saved to savedSearches!');
  } catch (error) {
    // Dispatch the error action with a meaningful message
    dispatch(setFavoriteError('Failed to save to savedSearches. Please try again later.'));
    console.error('Error saving favorite:', error);

    // Optionally, show an error message to the user
    alert('Failed to save flight to savedSearches.');
  }
};
