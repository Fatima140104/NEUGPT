import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice";
import type { TShowToast } from "@/common/types";

export default function useToast() {
  const dispatch = useDispatch();
  return {
    showToast: useCallback(
      (toast: TShowToast) => {
        dispatch(showToast(toast));
      },
      [dispatch]
    ),
  };
}
