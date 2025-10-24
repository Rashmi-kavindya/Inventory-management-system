// src/pages/ExpiryAlerts.js

import React, { useEffect, useCallback } from 'react';
import axios from 'axios';
import { useExpiry } from '../contexts/ExpiryContext';

export default function ExpiryAlerts() {
  const { expiryDays, setExpiryDays } = useExpiry();
  const [expiryItems, setExpiryItems] = React.useState([]);
  const [error, setError] = React.useState('');

  const fetchExpiry = useCallback(async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/near_expiry?days=${expiryDays}`);
      setExpiryItems(response.data);
    } catch (err) {
      console.error('Expiry fetch error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch expiry alerts');
    }
  }, [expiryDays]);

  useEffect(() => {
    fetchExpiry();
  }, [fetchExpiry]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Expiry Alerts</h1>
      {error && <p className="mb-4 text-red-600 font-semibold">Error: {error}</p>}
      <div className="mb-4">
        <label>Alert Threshold (days): </label>
        <input
          type="number"
          value={expiryDays}
          onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
          min="1"
          max="90"
          className="ml-2 border p-1 rounded"
        />
        <button onClick={fetchExpiry} className="ml-2 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
          Update
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expiryItems.map(item => (
          <div key={item.id || item.product_name} className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
            <h3 className="font-semibold">{item.product_name}</h3>
            <p>Stock: {item.stock_quantity} | Days Left: {item.days_left}</p>
            <p className="text-purple-600 font-medium">Suggested Discount: {item.recommended_discount}%</p>
            <p className="text-blue-600">Bundle: {item.bundling_suggestion}</p>
            <p className="text-green-600">Tip: {item.loyalty_tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}