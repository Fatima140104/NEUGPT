import { getToken } from "./auth";

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {}
) {
  const token = getToken();
  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(input, { ...init, headers });
}
