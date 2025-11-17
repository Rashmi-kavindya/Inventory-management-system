// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import logo from '../assets/Logo.png';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('userId', response.data.id);

      // Build and set profilePic URL if filename exists
      const filename = response.data.profile_pic;
      if (filename) {
        const imageUrl = `http://127.0.0.1:5000/uploads/profile/${filename}`;
        localStorage.setItem('profilePic', imageUrl);
      } else {
        localStorage.setItem('profilePic', 'https://via.placeholder.com/40');  // Fallback
      }

      onLogin();  // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Stockly" className="h-24 w-24 rounded-full" />
        </div>
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-6 text-center">Login to Stockly</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500" />
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition">Login</button>
        </form>
        {error && <p className="mt-4 text-red-600 text-center font-semibold">Error: {error}</p>}
      </div>
    </div>
  );
}