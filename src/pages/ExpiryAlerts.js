// src/pages/ExpiryAlerts.js

import React, { useEffect, useCallback } from 'react';
import axios from 'axios';
import { useExpiry } from '../contexts/ExpiryContext';
import toast from 'react-hot-toast';

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

  // success handler
  const handleUpdate = () => {
    fetchExpiry();                                 // refresh the list
    toast.success(`Expiry alert threshold updated to ${expiryDays} days!`);
  };

  return (
    <div className="min-h-screen bg-stockly-50 dark:bg-stockly-950 pt-20 px-6">
      <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-stockly-900 dark:text-stockly-50 mb-6">Expiry Alerts</h1>
      {error && <p className="mb-4 text-red-600 dark:text-red-300 font-semibold">Error: {error}</p>}
      <div className="mb-6 flex items-center gap-2 text-stockly-900 dark:text-stockly-100">
        <label className="text-sm font-semibold">Alert Threshold (days):</label>
        <input
          type="number"
          value={expiryDays}
          onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
          min="1"
          max="90"
          className="border border-gray-300 dark:border-stockly-800 bg-white dark:bg-stockly-900 text-stockly-900 dark:text-stockly-50 p-1 rounded w-20"
        />
        <button
          onClick={handleUpdate}
          className="bg-stockly-400 text-stockly-950 px-3 py-1 rounded hover:bg-stockly-500 transition font-semibold"
        >
          Update
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expiryItems.map(item => (
          <div key={item.id || item.product_name} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border-l-4 border-yellow-400 dark:border-yellow-500 text-stockly-900 dark:text-stockly-50">
            <h3 className="font-semibold">{item.product_name}</h3>
            <p className="text-sm text-gray-700 dark:text-stockly-200">Stock: {item.stock_quantity} | Days Left: {item.days_left}</p>
            <p className="text-stockly-600 dark:text-stockly-300 font-medium text-sm">Suggested Discount: {item.recommended_discount}%</p>
            <p className="text-blue-600 dark:text-blue-300 text-sm">Bundle: {item.bundling_suggestion}</p>
            <p className="text-stockly-700 dark:text-stockly-200 text-sm">Tip: {item.loyalty_tip}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}


