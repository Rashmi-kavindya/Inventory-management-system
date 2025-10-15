// src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';  // Plotly import
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  // States (same as before)
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);  // For pie
  const [expiryItems, setExpiryItems] = useState([]);  // For bar
  const [deadStock, setDeadStock] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(1);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedItem, setSelectedItem] = useState({ code: '', name: '' });
  const [addForm, setAddForm] = useState({ stock_quantity: '', expire_date: '' });

  useEffect(() => {
    fetchSalesForTrends(selectedItemId);
    fetchInventory();
    fetchExpiry();
    fetchDeadStock();
    fetchItems();  // For dropdowns
  }, [selectedItemId]);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/items');
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  // Filter items for dropdown
  useEffect(() => {
    let filtered = items;
    if (selectedDept) filtered = filtered.filter(item => item.department === selectedDept);
    if (selectedType) filtered = filtered.filter(item => item.type === selectedType);
    setFilteredItems(filtered);
    setSelectedItem({ code: '', name: '' });
  }, [selectedDept, selectedType, items]);

  const handleItemSelect = (item) => {
    setSelectedItem({ code: item.item_code, name: item.item_name });
  };

  const handleChange = (e) => setAddForm({ ...addForm, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem.code) return alert('Select an item first from the dropdown');
    try {
      await axios.post('http://127.0.0.1:5000/add_inventory', {
        ...addForm,
        product_code: selectedItem.code,
        product_name: selectedItem.name
      });
      alert('Stock added successfully!');
      fetchExpiry();  // Refresh alerts
      setAddForm({ stock_quantity: '', expire_date: '' });
      setSelectedItem({ code: '', name: '' });
      setSelectedDept(''); setSelectedType('');
    } catch (err) {
      alert('Error adding stock: ' + (err.response?.data?.error || err.message));
    }
  };

  const fetchSalesForTrends = async (itemId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/sales/${itemId}`);
      const formatted = response.data.map(d => ({ name: `${d.month}/${d.year}`, quantity: d.quantity_sold }));
      setSalesData(formatted);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const fetchExpiry = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/near_expiry?days=30');
      console.log('Expiry API response:', response.data);  // Debug: Check in console
      setExpiryItems(response.data);
    } catch (err) {
      console.error('Error fetching expiry:', err);
    }
  };

  const fetchDeadStock = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dead_stock?months_back=3');
      console.log('Dead stock API response:', response.data);  // Debug
      setDeadStock(response.data);
    } catch (err) {
      console.error('Error fetching dead stock:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Quick Add Section with Dropdowns & Labels */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><PlusIcon className="h-5 w-5 mr-2" /> Quick Add Inventory</h2>
        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="border p-2 rounded">
            <option value="">All Departments</option>
            {[...new Set(items.map(i => i.department))].sort().map(dept => <option key={dept}>{dept}</option>)}
          </select>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="border p-2 rounded">
            <option value="">All Types</option>
            {[...new Set(items.map(i => i.type))].sort().map(typ => <option key={typ}>{typ}</option>)}
          </select>
          <select onChange={(e) => {
            const selectedValue = e.target.value;
            const item = filteredItems.find(i => i.item_name === selectedValue.split(' (')[0]);  // Parse name from "Name (Code)"
            if (item) handleItemSelect(item);
          }} className="border p-2 rounded md:col-span-2">
            <option value="">Select Item ({filteredItems.length} available)</option>
            {filteredItems.map(item => <option key={item.item_id}>{item.item_name} ({item.item_code})</option>)}
          </select>
          <input type="text" value={selectedItem.name} placeholder="Product Name (Auto-filled)" readOnly className="border p-2 rounded bg-gray-100" />
          <input type="text" value={selectedItem.code} placeholder="Product Code (Auto-filled)" readOnly className="border p-2 rounded bg-gray-100" />
          <input type="number" name="stock_quantity" placeholder="Quantity to Add" value={addForm.stock_quantity} onChange={handleChange} required className="border p-2 rounded" />
          <input type="date" name="expire_date" placeholder="Expiry Date (YYYY-MM-DD)" value={addForm.expire_date} onChange={handleChange} required className="border p-2 rounded" />
          <button type="submit" className="md:col-span-2 bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Add Stock</button>
        </form>
      </div>

      {/* 3-Column Grid for Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Monthly Sales Trends</h2>
          <select onChange={(e) => setSelectedItemId(e.target.value)} className="mb-4 p-2 border rounded">
            <option value="1">Glue Stick (ID 1)</option>
            <option value="2">Pencil HB (ID 2)</option>
            <option value="3">Lifebuoy Soap (ID 3)</option>
            {/* Add more as needed */}
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
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" /> Near-Expiry (30 Days)</h2>
          {expiryItems.length === 0 ? (
            <p className="text-gray-500">No urgent items (check console for API response).</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {expiryItems.map((item, index) => (
                <li key={index} className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400 text-sm">
                  <div className="font-semibold">{item.product_name}</div>
                  <div>{item.stock_quantity} units, {item.days_left} days left</div>
                  <div className="text-purple-600">Discount: {item.recommended_discount}%</div>
                  <div className="text-blue-600">Bundle: {item.bundling_suggestion}</div>
                  <div className="text-green-600">Tip: {item.loyalty_tip}</div>
                </li>
              ))}
            </ul>
          )}
          <button onClick={fetchExpiry} className="mt-4 text-purple-600 underline">Refresh</button>
        </div>

        {/* Dead Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Dead Stock Alerts</h2>
          {deadStock.length === 0 ? (
            <p className="text-gray-500">No dead stock detected.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {deadStock.map((item, index) => (
                <li key={index} className="p-3 bg-red-50 rounded border-l-4 border-red-400 text-sm">
                  <div>{item.item_name}: {item.stock_quantity} units</div>
                  <div>Recent Sales: {item.recent_sales}</div>
                  <div className="text-purple-600">{item.recommendation}</div>
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