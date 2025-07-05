import { configureStore } from "@reduxjs/toolkit";
import settingsReducer from "@/store/settingsSlice";
import toastReducer from "@/store/toastSlice";

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Chat Setting
