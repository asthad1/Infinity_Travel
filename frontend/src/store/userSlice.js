import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  email: null,  // Use 'email' instead of 'username'
  user_id: null,  
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      if (action.payload && action.payload.email && action.payload.user_id) {
        state.email = action.payload.email;  // Store email
        state.user_id = action.payload.user_id;  // Store user_id
      } else {
        console.error("Invalid payload for setUser:", action.payload);
      }
    },
    clearUser: (state) => {
      state.email = null;
      state.user_id = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
