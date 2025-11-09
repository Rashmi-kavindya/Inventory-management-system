// src/pages/Settings.js
import React, { useState } from 'react';
import axios from 'axios';

export default function Settings() {
  const [name, setName] = useState(localStorage.getItem('username') || '');
  const [file, setFile] = useState(null);

  const handleSave = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('profilePic', reader.result);
        alert('Profile updated!');
        window.location.reload();
      };
      reader.readAsDataURL(file);
    }
    if (name) {
      localStorage.setItem('username', name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Settings</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <img src={localStorage.getItem('profilePic') || 'https://via.placeholder.com/120'} alt="Profile" className="h-32 w-32 rounded-full ring-4 ring-purple-500" />
              <div>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="block" />
                <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}