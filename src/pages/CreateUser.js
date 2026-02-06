// src/pages/CreateUser.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateUser() {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'employee' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

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
      let response;
      if (editingUser) {
        // Update existing user (backend must implement PUT /users/<id>)
        response = await axios.put(`http://127.0.0.1:5000/users/${editingUser.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(response.data.message || 'User updated');
        setEditingUser(null);
      } else {
        response = await axios.post('http://127.0.0.1:5000/register', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(response.data.message);
      }
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

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username || '', password: '', role: user.role || 'employee' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'employee' });
    setError(''); setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-stockly-blue dark:text-stockly-green mb-10">Create New User</h1>

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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stockly-green"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stockly-green"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stockly-green"
            >
              <option value="employee">Employee/Cashier</option>
              <option value="manager">Manager/Owner</option>
            </select>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-stockly-green to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-900 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              {editingUser && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-40 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-4 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          {message && <p className="mt-6 text-green-600 text-center font-semibold text-lg">{message}</p>}
          {error && <p className="mt-6 text-red-600 text-center font-semibold text-lg">Error: {error}</p>}
        </div>

        {/* User List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-stockly-green to-emerald-400 p-6">
            <h2 className="text-2xl font-bold text-slate-900">All Users ({users.length})</h2>
          </div>
          {loading ? (
            <p className="text-center py-10 text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center py-10 text-gray-500">No users found.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-green-100 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-stockly-blue dark:text-stockly-green font-bold">Username</th>
                  <th className="px-6 py-4 text-left text-stockly-blue dark:text-stockly-green font-bold">Role</th>
                  <th className="px-6 py-4 text-left text-stockly-blue dark:text-stockly-green font-bold">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t dark:border-gray-700 hover:bg-green-50 dark:hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 font-medium flex items-center justify-between">
                      <span>{user.username}</span>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                        user.role === 'manager'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.created_at ? user.created_at.split(' ')[0] : '-'}</td>
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