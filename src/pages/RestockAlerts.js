// src/pages/RestockAlerts.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RestockAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/inventory').then(res => {
      const lowStock = res.data.filter(i => i.stock_quantity <= i.reorder_level);
      setAlerts(lowStock);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-stockly-green mb-10">Restock Alerts</h1>
        <div className="grid gap-6">
          {alerts.map(item => (
            <div key={item.item_id} className="bg-orange-50 border-l-8 border-orange-500 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold">{item.product_name}</h3>
              <p>Stock: <strong>{item.stock_quantity}</strong> ≤ Reorder Level: <strong>{item.reorder_level}</strong></p>
              <p className="text-orange-700 font-semibold mt-2">→ Order {item.reorder_quantity || 50} units immediately</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}