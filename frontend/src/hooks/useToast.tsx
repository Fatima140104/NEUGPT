import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideToast, showToast as showToastAction } from "@/store/toastSlice";
import { type TShowToast, NotificationSeverity } from "@/common/types";
import type { RootState } from "@/store/store";

export default function useToast(showDelay = 100) {
  const dispatch = useDispatch();
  const toast = useSelector((state: RootState) => state.toast);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (showTimerRef.current !== null) {
        clearTimeout(showTimerRef.current);
      }
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback(
    ({
      message,
      severity = NotificationSeverity.SUCCESS,
      showIcon = true,
      duration = 3000,
      status,
    }: TShowToast) => {
      // Clear existing timeouts
      if (showTimerRef.current !== null) {
        clearTimeout(showTimerRef.current);
      }
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
      }

      // Timeout to show the toast
      showTimerRef.current = window.setTimeout(() => {
        dispatch(
          showToastAction({
            message,
            severity: (status as NotificationSeverity) ?? severity,
            showIcon,
            duration,
          })
        );
        // Hides the toast after the specified duration
        hideTimerRef.current = window.setTimeout(() => {
          dispatch(hideToast());
        }, duration);
      }, showDelay);
    },
    [dispatch, showDelay]
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) dispatch(hideToast());
    },
    [dispatch]
  );

  return {
    toast,
    onOpenChange,
    showToast,
  };
}
