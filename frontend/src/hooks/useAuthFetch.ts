import { useCallback } from "react";
import api from "../lib/api";

export function useAuthFetch() {
  return useCallback((url: string, config?: any) => {
    // The hook now simply uses the pre-configured axios instance.
    // All auth logic is handled by the interceptors in `api.ts`.
    return api(url, config);
  }, []);
}
