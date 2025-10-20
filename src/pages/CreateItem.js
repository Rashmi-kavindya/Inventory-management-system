// src/pages/CreateItem.js
import React, { useState } from 'react';
import axios from 'axios';

export default function CreateItem() {
  const [form, setForm] = useState({ item_code: '', item_name: '', department: '', type: '', reorder_level: 10, reorder_quantity: 50 });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/add_item', form);
      alert('Item added!');
      setForm({ item_code: '', item_name: '', department: '', type: '', reorder_level: 10, reorder_quantity: 50 });
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Item</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="item_code" value={form.item_code} onChange={handleChange} placeholder="Item Code" required className="border p-2 rounded" />
        <input name="item_name" value={form.item_name} onChange={handleChange} placeholder="Item Name" required className="border p-2 rounded" />
        <input name="department" value={form.department} onChange={handleChange} placeholder="Department" required className="border p-2 rounded" />
        <input name="type" value={form.type} onChange={handleChange} placeholder="Type" required className="border p-2 rounded" />
        <input type="number" name="reorder_level" value={form.reorder_level} onChange={handleChange} placeholder="Reorder Level" className="border p-2 rounded" />
        <input type="number" name="reorder_quantity" value={form.reorder_quantity} onChange={handleChange} placeholder="Reorder Quantity" className="border p-2 rounded" />
        <button type="submit" className="md:col-span-2 bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Add Item</button>
      </form>
    </div>
  );
}