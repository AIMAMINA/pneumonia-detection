// utils/auth.js
import { jwtDecode } from "jwt-decode"
import { ACCESS_TOKEN } from "../src/constants";

export const getToken = () => {
  return localStorage.getItem('access');
};

// Get the refresh token from localStorage
export const getRefreshToken = () => {
  return localStorage.getItem('refresh');
};

export function isLoggedIn() {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch (err) {
    return false;
  }
};

// Store tokens in localStorage after login
export const setTokens = (access, refresh) => {
  localStorage.setItem('access', access);
  if (refresh) {
    localStorage.setItem('refresh', refresh);
  }
};

// Remove tokens on logout
export const clearTokens = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
  } catch (e) {
    console.error("Error parsing token:", e);
    return true;
  }
};

// Format for token to be used in Axios headers
export const authHeaders = () => {
  const token = getToken();
  if (!token) return {};
  
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
};
