import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ExpiryAlerts() {
  const [items, setItems] = useState([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchItems();
  }, [days]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/near_expiry?days=${days}`);
      setItems(response.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Expiry Alerts</h1>
      <div className="mb-4">
        <label>Alert Threshold: </label>
        <input type="number" value={days} onChange={(e) => setDays(e.target.value)} min="1" max="90" className="ml-2 border p-1 rounded" />
        <button onClick={fetchItems} className="ml-2 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">Update</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
            <h3 className="font-semibold">{item.product_name}</h3>
            <p>Stock: {item.stock_quantity} | Days Left: {item.days_left}</p>
            <p className="text-purple-600 font-medium">Suggested Discount: {item.recommended_discount}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}