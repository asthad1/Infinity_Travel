import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  email: null,  // Use 'email' instead of 'username'
  user_id: null,  
};

// Create user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;  // Store email instead of username
      state.user_id = action.payload.user_id;  // Store user_id
    },
    clearUser: (state) => {
      state.email = null;
      state.user_id = null;  
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
