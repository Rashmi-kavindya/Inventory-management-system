// src/pages/Settings.js
import React, { useState } from 'react';
import axios from 'axios';

export default function Settings() {
  const name = localStorage.getItem('username') || '';
  const [file, setFile] = useState(null);

  const handleSave = async () => {
    if (!file) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('profile_pic', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://127.0.0.1:5000/upload_profile_pic',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const filename = res.data.filename;
      const imageUrl = `http://127.0.0.1:5000/uploads/profile/${filename}?t=${Date.now()}`; // cache bust

      localStorage.setItem('profilePic', imageUrl);
      alert('Profile picture updated!');
      window.location.reload();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-stockly-50 dark:bg-stockly-950 pt-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-stockly-900 dark:text-stockly-50 mb-8">Settings</h1>
        
        <div className="bg-white dark:bg-stockly-900 rounded-2xl shadow-xl p-8 border border-stockly-100 dark:border-stockly-800">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <img src={localStorage.getItem('profilePic') || 'https://via.placeholder.com/120'} alt="Profile" className="h-32 w-32 rounded-full ring-4 ring-stockly-green shadow-lg" />
              <div>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="block" />
                <p className="text-sm text-gray-500 dark:text-stockly-200 mt-2">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-stockly-200">Username</label>
              <input
                type="text"
                value={name}
                readOnly
                className="mt-2 w-full px-4 py-3 border border-gray-200 dark:border-stockly-800 rounded-lg bg-gray-100 dark:bg-stockly-900 text-gray-600 dark:text-stockly-200 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-stockly-200 mt-2">Username cannot be changed here. Contact an admin to request a username change.</p>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-stockly-400 to-stockly-300 hover:from-stockly-500 hover:to-stockly-400 text-stockly-950 py-3 rounded-lg font-semibold hover:shadow-lg transition shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


