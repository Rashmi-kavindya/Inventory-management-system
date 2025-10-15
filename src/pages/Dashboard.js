// src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [salesData, setSalesData] = useState([]);  // For trends
  const [expiryItems, setExpiryItems] = useState([]);
  const [addForm, setAddForm] = useState({ product_code: '', stock_quantity: '', expire_date: '' });
  const [selectedItemId, setSelectedItemId] = useState(1);

  useEffect(() => {
    fetchSalesForTrends(selectedItemId);
    fetchExpiry();
  }, [selectedItemId]);

  const fetchSalesForTrends = async (itemId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/sales/${itemId}`);
      const formatted = response.data.map(d => ({ name: `${d.month}/${d.year}`, quantity: d.quantity_sold }));
      setSalesData(formatted);
    } catch (err) { console.error(err); }
  };

  const fetchExpiry = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/near_expiry?days=30');
      setExpiryItems(response.data);
    } catch (err) { console.error(err); }
  };

  const [deadStock, setDeadStock] = useState([]);
  useEffect(() => { fetchDeadStock(); }, []);  // On load

  const fetchDeadStock = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dead_stock?months_back=3');
      setDeadStock(response.data);
    } catch (err) { console.error(err); }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/add_inventory', addForm);
      alert('Stock added!');  // Refresh dashboard data
      fetchExpiry();  // Update alerts
      setAddForm({ product_code: '', stock_quantity: '', expire_date: '' });
    } catch (err) { alert('Error: ' + err.response?.data?.error); }
  };

  const handleChange = (e) => setAddForm({ ...addForm, [e.target.name]: e.target.value });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Quick Add Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><PlusIcon className="h-5 w-5 mr-2" /> Quick Add Inventory</h2>
        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" name="product_code" placeholder="Product Code" value={addForm.product_code} onChange={handleChange} required className="border p-2 rounded" />
          <input type="number" name="stock_quantity" placeholder="Quantity" value={addForm.stock_quantity} onChange={handleChange} required className="border p-2 rounded" />
          <input type="date" name="expire_date" value={addForm.expire_date} onChange={handleChange} required className="border p-2 rounded" />
          <button type="submit" className="md:col-span-3 bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Add Stock</button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Monthly Sales Trends</h2>
          <select onChange={(e) => setSelectedItemId(e.target.value)} className="mb-4 p-2 border rounded">
            <option value="1">Glue Stick</option> {/* Add more dynamically later */}
          </select>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="quantity" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expiry Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" /> Near-Expiry (30 Days)</h2>
          {expiryItems.length === 0 ? (
            <p className="text-gray-500">All good—no urgent items!</p>
          ) : (
            <ul className="space-y-2">
              {expiryItems.map(item => (
                <li key={item.id} className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <div>{item.product_name}: {item.stock_quantity} units, {item.days_left} days left.</div>
                  <div className="text-sm text-purple-600">Recommend: {item.recommended_discount}% discount</div>
                </li>
              ))}
            </ul>
          )}
          <button onClick={fetchExpiry} className="mt-4 text-purple-600 underline">Refresh</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Dead Stock Alerts</h2>
            {deadStock.length === 0 ? (
                <p className="text-gray-500">No dead stock detected.</p>
            ) : (
                <ul className="space-y-2">
                {deadStock.map(item => (
                    <li key={item.id} className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                    <div>{item.item_name}: {item.stock_quantity} units, Recent Sales: {item.recent_sales}</div>
                    <div className="text-sm text-purple-600">{item.recommendation}</div>
                    </li>
                ))}
                </ul>
            )}
            <button onClick={fetchDeadStock} className="mt-4 text-purple-600 underline">Refresh</button>
        </div>

      </div>
    </div>
  );
}