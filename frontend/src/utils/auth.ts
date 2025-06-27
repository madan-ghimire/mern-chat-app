import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string;
  role: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function removeToken(): void {
  localStorage.removeItem("token");
}

export function getUserFromToken(): DecodedToken | null {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now(); // convert to ms
    return isExpired ? null : decoded;
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getUserFromToken() !== null;
}
