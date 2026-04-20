import axios from 'axios';

export const API_BASE = 'http://localhost:8080/api/v1';
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

// Response error handling with user-friendly messages
api.interceptors.response.use(
  response => response,
  error => {
    // Prepare user-friendly error message
    if (error.response) {
      switch(error.response.status) {
        case 400:
          error.userMessage = error.response.data?.message || 'Invalid request.';
          break;
        case 401:
          error.userMessage = error.response.data?.message || 'Authentication required.';
          break;
        case 403:
          error.userMessage = error.response.data?.message || 'Permission denied.';
          break;
        case 404:
          error.userMessage = 'Resource not found.';
          break;
        case 409:
          error.userMessage = error.response.data?.message || 'Request conflict.';
          break;
        case 500:
          error.userMessage = 'Server error. Please try again later.';
          break;
        default:
          error.userMessage = error.response.data?.message || `Error ${error.response.status}. Please try again.`;
      }
    } else if (error.request) {
      error.userMessage = 'Network unreachable. Please check connection.';
    } else {
      error.userMessage = 'Network error - please retry.';
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});