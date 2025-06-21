import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, AuthError } from "../lib/fetchWithAuth";
import { removeToken } from "../lib/auth";

export function useAuthFetch() {
  const navigate = useNavigate();

  return useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      try {
        return await fetchWithAuth(input, init);
      } catch (e) {
        if (e instanceof AuthError) {
          removeToken();
          navigate("/login", { replace: true });
          return null;
        }
        throw e;
      }
    },
    [navigate]
  );
}
