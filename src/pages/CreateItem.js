// src/pages/CreateItem.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateItem() {
  const [nextCode, setNextCode] = useState('');
  const [form, setForm] = useState({
    item_name: '',
    department: '',
    type: '',
    reorder_level: 10
  });

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/next_item_code')
      .then(res => setNextCode(res.data.next_code))
      .catch(() => setNextCode('?'));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/add_item', { ...form, item_code: nextCode });
      alert('Item added!');
      setForm({ item_name: '', department: '', type: '', reorder_level: 10 });
      const res = await axios.get('http://127.0.0.1:5000/next_item_code');
      setNextCode(res.data.next_code);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Item</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Code (auto-generated)</label>
          <div className="bg-gray-100 border border-gray-300 text-gray-800 font-mono text-lg p-3 rounded-lg text-center">
            {nextCode || 'Loading...'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <input name="item_name" value={form.item_name} onChange={handleChange} placeholder="e.g., Coca Cola 1L" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-600" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input name="department" value={form.department} onChange={handleChange} placeholder="e.g., Beverages" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-600" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <input name="type" value={form.type} onChange={handleChange} placeholder="e.g., Beverages" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-600" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level (units)</label>
          <input type="number" name="reorder_level" value={form.reorder_level} onChange={handleChange} min="1" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-600" />
          <p className="text-xs text-gray-500 mt-1">Alert when stock ≤ this number</p>
        </div>

        <button type="submit" className="md:col-span-2 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
          Add Item
        </button>
      </form>
    </div>
  );
}