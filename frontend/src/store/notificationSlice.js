// notificationSlice.js

import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    count: 0,
  },
  reducers: {
    setNotificationCount: (state, action) => {
      state.count = action.payload;
    },
    incrementNotificationCount: (state, action) => {
      state.count += action.payload;
    },
    resetNotificationCount: (state) => {
      state.count = 0;
    },
  },
});

export const {
  setNotificationCount,
  incrementNotificationCount,
  resetNotificationCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
