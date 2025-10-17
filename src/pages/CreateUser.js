// src/pages/CreateUser.js

import React, { useState } from 'react';
import axios from 'axios';

export default function CreateUser() {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'employee' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/register', formData);
      setMessage(response.data.message);
    } catch (err) {
        console.error('Create user error:', err);
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
        <select name="role" onChange={handleChange} className="w-full border p-3 rounded-lg">
          <option value="employee">Employee/Cashier</option>
          <option value="manager">Manager/Owner</option>
        </select>
        <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700">Create User</button>
      </form>
      {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}
      {error && <p className="mt-4 text-red-600 font-semibold">Error: {error}</p>}
    </div>
  );
}