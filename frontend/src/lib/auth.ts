import { jwtDecode } from "jwt-decode";

export function setToken(token: string) {
  localStorage.setItem("jwt_token", token);
}
export function getToken(): string | null {
  return localStorage.getItem("jwt_token");
}
export function removeToken() {
  localStorage.removeItem("jwt_token");
}

export function getUserFromToken(): any | null {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}
