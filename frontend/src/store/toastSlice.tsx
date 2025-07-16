import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { TShowToast } from "@/common/types";

type ToastState = {
  message: string;
  severity?: string;
  showIcon?: boolean;
  duration?: number;
  open: boolean;
};

const initialState: ToastState = {
  message: "",
  severity: "info",
  showIcon: true,
  duration: 3000,
  open: false,
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast(state, action: PayloadAction<TShowToast>) {
      state.message = action.payload.message;
      state.severity = action.payload.severity ?? "info";
      state.showIcon = action.payload.showIcon ?? true;
      state.duration = action.payload.duration ?? 3000;
      state.open = true;
    },
    hideToast(state) {
      state.open = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
