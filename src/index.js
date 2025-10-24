// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import { ExpiryProvider } from './contexts/ExpiryContext';

// Set up Axios request interceptor globally (for JWT headers)
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Add response interceptor to handle 401 (token expired/invalid)
axios.interceptors.response.use(
  response => response,  // Pass through successful responses
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid: Clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      alert('Your session has expired. Please log in again.');  // user notification
      window.location.href = '/';  // Redirect to root (which shows Login if not logged in)
    }
    return Promise.reject(error);  // Re-throw for page-specific handling
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ExpiryProvider>
        <App />
      </ExpiryProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();