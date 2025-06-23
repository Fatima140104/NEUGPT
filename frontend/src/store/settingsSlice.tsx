import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  LaTeXParsing: boolean;
  scrollButtonPreference: boolean;
}

const initialState: SettingsState = {
  LaTeXParsing: true,
  scrollButtonPreference: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLaTeXParsing(state, action: PayloadAction<boolean>) {
      state.LaTeXParsing = action.payload;
    },
    setScrollButtonPreference(state, action: PayloadAction<boolean>) {
      state.scrollButtonPreference = action.payload;
    },
  },
});

export const { setLaTeXParsing, setScrollButtonPreference } =
  settingsSlice.actions;
export default settingsSlice.reducer;
