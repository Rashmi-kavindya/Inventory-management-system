// src/pages/RestockAlerts.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RestockAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.get('http://127.0.0.1:5000/inventory', { headers }).then(res => {
      const lowStock = res.data.filter(i => i.stock_quantity <= i.reorder_level);
      setAlerts(lowStock);
    });
  }, []);

  return (
    <div className="min-h-screen bg-stockly-50 dark:bg-stockly-950 pt-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-stockly-600 dark:text-stockly-300 mb-10">Restock Alerts</h1>
        <div className="grid gap-6">
          {alerts.map(item => {
            const suggested = Math.max(0, Number(item.reorder_level) - Number(item.stock_quantity));
            return (
              <div key={item.item_id} className="bg-orange-50 dark:bg-orange-900/20 border-l-8 border-orange-500 dark:border-orange-400 p-6 rounded-xl shadow-lg text-stockly-900 dark:text-stockly-50">
                <h3 className="text-xl font-bold">{item.product_name}</h3>
                <p className="text-sm text-gray-700 dark:text-stockly-200">Stock: <strong>{item.stock_quantity}</strong> = Reorder Level: <strong>{item.reorder_level}</strong></p>
                <p className="text-orange-700 dark:text-orange-300 font-semibold mt-2">Order {suggested} units immediately</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
