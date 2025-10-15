// src/pages/Dashboard.js

import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  // States
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [expiryItems, setExpiryItems] = useState([]);
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
    fetchItems();
  }, [selectedItemId]);

  // Resize listener for responsive charts (fixes overlap)
  useLayoutEffect(() => {
    const handleResize = () => window.dispatchEvent(new Event('resize'));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      fetchExpiry();
      fetchInventory();  // Refresh pie
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
      console.log('Sales data for line chart:', formatted);  // Debug
      setSalesData(formatted);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/inventory');
      console.log('Inventory data for pie:', response.data);
      setInventoryData(response.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const fetchExpiry = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/near_expiry?days=30');
      console.log('Expiry API response:', response.data);
      setExpiryItems(response.data);
    } catch (err) {
      console.error('Error fetching expiry:', err);
    }
  };

  const fetchDeadStock = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dead_stock?months_back=3');
      console.log('Dead stock API response:', response.data);
      setDeadStock(response.data);
    } catch (err) {
      console.error('Error fetching dead stock:', err);
    }
  };

  // FIXED: Aggregate pie by dept (useMemo for perf; map dept from items)
  const deptStockMap = useMemo(() => {
    const map = {};
    inventoryData.forEach(item => {
      const matchingItem = items.find(i => i.item_code === item.product_code);
      const dept = matchingItem ? matchingItem.department : 'Unknown';
      map[dept] = (map[dept] || 0) + item.stock_quantity;
    });
    return Object.entries(map);
  }, [inventoryData, items]);

  const pieData = deptStockMap.length > 0 ? [
    {
      values: deptStockMap.map(([, stock]) => stock),
      labels: deptStockMap.map(([dept]) => dept),
      type: 'pie',
      marker: { colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#FF9999'] },
      textinfo: 'label+percent',
      insidetextorientation: 'radial'
    }
  ] : [];

  // FIXED: Multi-color bar (cycle colors)
  const expiryCounts = expiryItems.length > 0 ? 
    Object.entries(expiryItems.reduce((acc, item) => {
      acc[item.type || 'Unknown'] = (acc[item.type || 'Unknown'] || 0) + 1;
      return acc;
    }, {})) : [];
  const barColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];
  const barData = [
    {
      x: expiryCounts.map(([type]) => type),
      y: expiryCounts.map(([, count]) => count),
      type: 'bar',
      marker: { color: expiryCounts.map((_, i) => barColors[i % barColors.length]) }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Quick Add Section */}
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
            const item = filteredItems.find(i => `${i.item_name} (${i.item_code})` === selectedValue);
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

      {/* Trends Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Sales Trends (Last 12 Months)</h2>
        <select onChange={(e) => setSelectedItemId(e.target.value)} className="mb-4 p-2 border rounded">
          <option value="">Select Item for Trends</option>
          {items.slice(0, 20).map(item => (
            <option key={item.item_id} value={item.item_id}>
              {item.item_name} (ID {item.item_id}, {item.department})
            </option>
          ))}
        </select>
        {salesData.length > 0 ? (
          <div className="h-80 w-full flex-1">  {/* Fixed container for no overlap */}
            <Plot
              data={[
                {
                  x: salesData.map(d => d.name),
                  y: salesData.map(d => d.quantity),
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: '#8B5CF6' },
                  line: { color: '#8B5CF6', width: 2 }
                }
              ]}
              layout={{
                title: 'Sales Quantity Over Time (Past Data)',
                xaxis: { title: 'Month/Year' },
                yaxis: { title: 'Quantity Sold' },
                height: 300,
                margin: { t: 40, b: 40, l: 40, r: 40 }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <p className="text-gray-500">Select an item to view historical trends from sales data. If empty, add data to sales_history table.</p>
        )}
      </div>

      {/* Bottom Grid: Pie + Bar (Responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Stock Distribution Pie (Aggregated) */}
        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
          <h2 className="text-xl font-semibold mb-4">Stock Distribution by Department</h2>
          {deptStockMap.length > 0 ? (
            <div className="h-80 w-full flex-1">
              <Plot
                data={pieData}
                layout={{
                  title: 'Total Stock by Department (Aggregated)',
                  height: 300,
                  margin: { t: 40, b: 40, l: 40, r: 40 }
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : (
            <p className="text-gray-500">No inventory data—add more samples for multi-slice pie</p>
          )}
          <button onClick={fetchInventory} className="mt-4 text-purple-600 underline">Refresh</button>
        </div>

        {/* Expiry by Type Bar (Multi-Color) */}
        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" /> Expiry Items by Type</h2>
          {expiryCounts.length > 0 ? (
            <div className="h-80 w-full flex-1">
              <Plot
                data={barData}
                layout={{
                  title: 'Near-Expiry Count by Type',
                  xaxis: { title: 'Type' },
                  yaxis: { title: 'Number of Items' },
                  height: 300,
                  margin: { t: 40, b: 40, l: 40, r: 40 }
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : (
            <p className="text-gray-500">No expiry data—add samples with repeated types for varied bars</p>
          )}
          <button onClick={fetchExpiry} className="mt-4 text-purple-600 underline">Refresh</button>
        </div>
      </div>

      {/* Detailed Expiry Tracking List */}
      {expiryItems.length > 0 && (
        <div className="bg-yellow-50 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-2">Detailed Near-Expiry Items</h3>
          <ul className="space-y-2">
            {expiryItems.map((item, index) => (
              <li key={index} className="p-3 bg-white rounded border-l-4 border-yellow-400 text-sm">
                <div className="font-medium">{item.product_name}</div>
                <div>{item.stock_quantity} units, {item.days_left} days left ({item.type})</div>
                <div className="text-purple-600">Recommended Discount: {item.recommended_discount}%</div>
                <div className="text-blue-600">Bundle Suggestion: {item.bundling_suggestion}</div>
                <div className="text-green-600">Tip: {item.loyalty_tip}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dead Stock Alerts */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Dead Stock Alerts</h2>
        {deadStock.length === 0 ? (
          <p className="text-gray-500">No dead stock detected.</p>
        ) : (
          <ul className="space-y-2">
            {deadStock.map((item, index) => (
              <li key={index} className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                <div>{item.item_name}: {item.stock_quantity} units, Recent Sales: {item.recent_sales}</div>
                <div className="text-sm text-purple-600">{item.recommendation}</div>
              </li>
            ))}
          </ul>
        )}
        <button onClick={fetchDeadStock} className="mt-4 text-purple-600 underline">Refresh</button>
      </div>
    </div>
  );
}