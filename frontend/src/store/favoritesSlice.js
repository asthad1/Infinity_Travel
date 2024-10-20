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
      state.error = action.payload;
    },
  },
});

export const { addFavoriteSuccess, setFavoriteError } = favoritesSlice.actions;
export default favoritesSlice.reducer;

// Thunk to save a favorite to the backend
export const saveFavorite = (favoriteData) => async (dispatch) => {
  try {
    const response = await axios.post('http://localhost:9001/api/favorites', favoriteData);
    dispatch(addFavoriteSuccess(response.data)); // Dispatch the success action with the favorite data
    alert('Flight saved to favorites!');
  } catch (error) {
    dispatch(setFavoriteError('Failed to save favorite.'));
    console.error('Error saving favorite:', error);
    alert('Failed to save flight to favorites.');
  }
};
