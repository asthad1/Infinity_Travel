// userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: null,
  user_id: null,
  role: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      if (action.payload && action.payload.email && action.payload.user_id) {
        state.email = action.payload.email;
        state.user_id = action.payload.user_id;
        state.role = action.payload.role || null;
      } else {
        console.error('Invalid payload for setUser:', action.payload);
      }
    },
    clearUser: (state) => {
      state.email = null;
      state.user_id = null;
      state.role = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
