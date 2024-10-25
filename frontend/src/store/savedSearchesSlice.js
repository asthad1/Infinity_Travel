import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchSavedSearches = createAsyncThunk(
  'savedSearches/fetchSavedSearches',
  async (userId) => {
    const response = await axios.get(`http://localhost:9001/api/saved-searches?user_id=${userId}`);
    return response.data;
  }
);

export const saveSearch = createAsyncThunk(
  'savedSearches/saveSearch',
  async (searchData) => {
    const response = await axios.post('http://localhost:9001/api/saved-searches', searchData);
    return response.data;
  }
);

export const executeSearch = createAsyncThunk(
  'savedSearches/executeSearch',
  async (searchId) => {
    const response = await axios.get(`http://localhost:9001/api/saved-searches/${searchId}/execute`);
    return response.data;
  }
);

export const deleteSavedSearch = createAsyncThunk(
  'savedSearches/deleteSavedSearch',
  async (searchId) => {
    await axios.delete(`http://localhost:9001/api/saved-searches/${searchId}`);
    return searchId;
  }
);

const savedSearchesSlice = createSlice({
  name: 'savedSearches',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchSavedSearches
      .addCase(fetchSavedSearches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSavedSearches.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchSavedSearches.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Handle saveSearch
      .addCase(saveSearch.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Handle deleteSearch
      .addCase(deleteSavedSearch.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export default savedSearchesSlice.reducer;