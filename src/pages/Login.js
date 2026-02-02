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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-teal-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-stockly-green/20 p-8">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Stockly" className="h-24 w-24 rounded-full shadow-lg ring-2 ring-stockly-green" />
        </div>
        <h1 className="text-3xl font-bold text-stockly-blue dark:text-stockly-green mb-6 text-center">Login to Stockly</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stockly-green focus:border-stockly-green dark:bg-slate-700 dark:text-white transition" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stockly-green focus:border-stockly-green dark:bg-slate-700 dark:text-white transition" />
          <button type="submit" className="w-full bg-gradient-to-r from-stockly-green to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-900 font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition">Login</button>
        </form>
        {error && <p className="mt-4 text-red-600 text-center font-semibold">Error: {error}</p>}
      </div>
    </div>
  );
}