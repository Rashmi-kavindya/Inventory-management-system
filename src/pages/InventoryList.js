import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/inventory');
      setInventory(response.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-left">Stock</th>
              <th className="px-6 py-3 text-left">Expire Date</th>
              <th className="px-6 py-3 text-left">Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} className="border-t">
                <td className="px-6 py-4">{item.product_name}</td>
                <td className="px-6 py-4">{item.stock_quantity}</td>
                <td className="px-6 py-4">{item.expire_date}</td>
                <td className="px-6 py-4">{item.reorder_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={fetchInventory} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Refresh</button>
    </div>
  );
}