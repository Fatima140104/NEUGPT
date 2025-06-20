import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  LaTeXParsing: boolean;
}

const initialState: SettingsState = {
  LaTeXParsing: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLaTeXParsing(state, action: PayloadAction<boolean>) {
      state.LaTeXParsing = action.payload;
    },
  },
});

export const { setLaTeXParsing } = settingsSlice.actions;
export default settingsSlice.reducer;
