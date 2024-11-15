import { createSlice } from '@reduxjs/toolkit';

const travelCreditSlice = createSlice({
  name: 'travelCredit',
  initialState: { balance: 0 },
  reducers: {
    setTravelCredit: (state, action) => {
      state.balance = action.payload;
    },
    updateTravelCredit: (state, action) => {
      state.balance += action.payload;
    },
  },
});

export const { setTravelCredit, updateTravelCredit } = travelCreditSlice.actions;
export default travelCreditSlice.reducer;
