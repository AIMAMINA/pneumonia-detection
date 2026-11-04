// src/api.js
// API configuration and utilities

import axios from 'axios';
import { getToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from '../tools/auth';

// API Base URL
export const API_URL = `${import.meta.env.VITE_API_URL}/`;

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
export const authHeaders = (options = {}) => {
  const token = getToken();
  
  if (!token) {
    return options;
  }
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };
};

// Request interceptor to handle token refresh
api.interceptors.request.use(async (config) => {
  const token = getToken();
  
  // If token exists but is expired, try to refresh it
  if (token && isTokenExpired(token)) {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject('Session expired');
      }
      
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken
      });
      
      // Store new tokens
      setTokens(response.data.access, response.data.refresh);
      
      // Update request with new token
      config.headers['Authorization'] = `Bearer ${response.data.access}`;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      window.location.href = '/login?expired=true';
      return Promise.reject(error);
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // If refresh token request failed, clear tokens and redirect to login
      if (error.config.url.includes('token/refresh')) {
        clearTokens();
        window.location.href = '/login?expired=true';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  register: (userData) => api.post('/register/', userData),
  login: (credentials) => api.post('/token/', credentials),
  refreshToken: (refresh) => api.post('/token/refresh/', { refresh }),
  
  // Profile
  getProfile: () => api.get('/profile/', authHeaders()),
  
  // Payments
  fakePayment: () => api.post('/fake-payment/', {}, authHeaders()),
  
  // Usage
  checkUse: () => api.post('/use-check/', {}, authHeaders()),
  
  // Predictions
  predictScan: (formData) => {
    return api.post('/predict-scan/', formData, {
      ...authHeaders(),
      headers: {
        ...authHeaders().headers,
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default api;