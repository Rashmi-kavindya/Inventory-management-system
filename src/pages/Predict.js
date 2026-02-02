import React, { useState } from 'react';
import axios from 'axios';

export default function Predict() {
  const [formData, setFormData] = useState({ product_name: '', month: '', type: '', department: '' });
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setPrediction('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/predict_reorder', formData);
      setPrediction(response.data.predicted_reorder_quantity);
    } catch (err) {
      console.error('Predict error:', err);
      setError(err.response?.data?.error || 'Network Error');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Predict Reorder</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="product_name" placeholder="Product Name" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
        <input type="number" name="month" placeholder="Month (1-12)" min="1" max="12" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
        <input type="text" name="type" placeholder="Type" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
        <input type="text" name="department" placeholder="Department" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
        <button type="submit" className="w-full bg-stockly-green text-slate-900 p-3 rounded-lg hover:bg-emerald-400 transition font-semibold shadow-lg hover:shadow-xl">Predict</button>
      </form>
      {prediction && <p className="mt-4 text-green-600 font-semibold">Predicted Quantity: {prediction}</p>}
      {error && <p className="mt-4 text-red-600 font-semibold">Error: {error}</p>}
    </div>
  );
}