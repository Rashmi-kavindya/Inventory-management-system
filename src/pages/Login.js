// src/pages/Login.js

import React, { useState } from 'react';
import axios from 'axios';

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
      onLogin();  // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Login to Stockly</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
        <button type="submit" className="w-full bg-stockly-green text-white p-3 rounded-lg hover:bg-purple-700">Login</button>
      </form>
      {error && <p className="mt-4 text-red-600 font-semibold">Error: {error}</p>}
    </div>
  );
}