// src/pages/CreateUser.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateUser() {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'employee' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // FETCH USER LIST
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/register', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(response.data.message);
      setFormData({ username: '', password: '', role: 'employee' });
      // Refresh user list
      const res = await axios.get('http://127.0.0.1:5000/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-purple-700 dark:text-purple-400 mb-10">Create New User</h1>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="employee">Employee/Cashier</option>
              <option value="manager">Manager/Owner</option>
            </select>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition"
            >
              Create User
            </button>
          </form>
          {message && <p className="mt-6 text-green-600 text-center font-semibold text-lg">{message}</p>}
          {error && <p className="mt-6 text-red-600 text-center font-semibold text-lg">Error: {error}</p>}
        </div>

        {/* User List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
            <h2 className="text-2xl font-bold text-white">All Users ({users.length})</h2>
          </div>
          {loading ? (
            <p className="text-center py-10 text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center py-10 text-gray-500">No users found.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-purple-100 dark:bg-purple-900">
                <tr>
                  <th className="px-6 py-4 text-left text-purple-800 dark:text-purple-200 font-bold">Username</th>
                  <th className="px-6 py-4 text-left text-purple-800 dark:text-purple-200 font-bold">Role</th>
                  <th className="px-6 py-4 text-left text-purple-800 dark:text-purple-200 font-bold">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition">
                    <td className="px-6 py-4 font-medium">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                        user.role === 'manager' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">2025-11-01</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}