// src/pages/DeadstockAlerts.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DeadstockAlerts() {
  const [deadstock, setDeadstock] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/dead_stock?months_back=3').then(res => {
      setDeadstock(res.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-red-600 mb-10">Dead Stock Alerts</h1>
        <div className="grid gap-6">
          {deadstock.map(item => (
            <div key={item.item_id} className="bg-red-50 border-l-8 border-red-600 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold">{item.item_name}</h3>
              <p>Stock: <strong>{item.stock_quantity}</strong> units</p>
              <p>Recent Sales: <strong>{item.recent_sales}</strong></p>
              <p className="text-red-700 font-bold mt-2">→ {item.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}