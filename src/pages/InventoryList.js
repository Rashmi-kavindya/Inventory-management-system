// src/pages/InventoryList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');

  // -------------------------------------------------
  // Load full inventory (including 0-stock items)
  // -------------------------------------------------
  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // -------------------------------------------------
  // Client-side search (fast, no extra request)
  // -------------------------------------------------
  const filtered = inventory.filter(item => {
    const term = search.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(term) ||
      item.item_code.toLowerCase().includes(term) ||
      item.department.toLowerCase().includes(term) ||
      item.type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Inventory List
      </h1>

      {/* ---------- SEARCH BAR ---------- */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, code, department or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 p-3 rounded-lg shadow-sm
                     focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                Dept
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                Expire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                Reorder
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(item => (
              <tr key={item.item_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm">{item.item_code}</td>
                <td className="px-6 py-4">{item.product_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.department}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.type}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.stock_quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : item.stock_quantity <= item.reorder_level
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {item.stock_quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {item.expire_date ? new Date(item.expire_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {item.reorder_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- REFRESH BUTTON ---------- */}
      <button
        onClick={fetchInventory}
        className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        Refresh List
      </button>
    </div>
  );
}