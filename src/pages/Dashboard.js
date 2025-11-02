// src/pages/Dashboard.js
import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { PlusIcon, ExclamationTriangleIcon, CloudIcon} from '@heroicons/react/24/outline';
import dashboardImg from '../assets/img.png';
import { useExpiry } from '../contexts/ExpiryContext';
import { useCallback } from 'react';

export default function Dashboard() {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [expiryItems, setExpiryItems] = useState([]);
  const [deadStock, setDeadStock] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(15);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedItem, setSelectedItem] = useState({ item_id: '', name: '' });
  const [addForm, setAddForm] = useState({ stock_quantity: '', expire_date: '', supplier: '', batch_number: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaleItemId, setSelectedSaleItemId] = useState('');
  const [quantitySold, setQuantitySold] = useState('');
  const [file, setFile] = useState(null);

  const [weather, setWeather] = useState(null);
  const [weatherCity, setWeatherCity] = useState('Colombo');  // Default

  const [newItemForm, setNewItemForm] = useState({
    next_code: '',
    item_name: '',
    department: '',
    type: '',
    reorder_level: 10
  });

  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username') || 'User';
  const { expiryDays } = useExpiry();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // ──────────────────────── EFFECTS ────────────────────────
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/next_item_code')
      .then(res => setNewItemForm(prev => ({ ...prev, next_code: res.data.next_code })))
      .catch(() => setNewItemForm(prev => ({ ...prev, next_code: '?' })));
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => window.dispatchEvent(new Event('resize'));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ──────────────────────── FETCHERS ────────────────────────
  const fetchItems = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/items');
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchInventorySales = async (itemId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/inventory_sales/${itemId}`);
      const sortedSales = response.data.sort((a, b) => {
        const dateA = new Date(`${a.name.split('/')[1]}-${a.name.split('/')[0]}-01`);
        const dateB = new Date(`${b.name.split('/')[1]}-${b.name.split('/')[0]}-01`);
        return dateA - dateB;
      });
      setSalesData(sortedSales);
    } catch (err) { console.error(err); }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/inventory');
      setInventoryData(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchExpiry = useCallback(async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/near_expiry?days=${expiryDays}`);
      setExpiryItems(response.data);
    } catch (err) { console.error(err); }
  }, [expiryDays]);

  const fetchDeadStock = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dead_stock?months_back=3');
      setDeadStock(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/weather?city=${weatherCity}`);
      setWeather(res.data);
    } catch (err) {
      alert('Weather fetch failed: ' + err.message);
    }
  };

  useEffect(() => {
    fetchInventorySales(selectedItemId);
    fetchInventory();
    fetchExpiry();
    fetchDeadStock();
    fetchItems();
    fetchWeather();
  }, [selectedItemId, expiryDays, fetchExpiry]);

  // ──────────────────────── HANDLERS ────────────────────────
  const handleNewItemChange = (e) => setNewItemForm({ ...newItemForm, [e.target.name]: e.target.value });

  const handleNewItemSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/add_item', {
        item_code: newItemForm.next_code,
        item_name: newItemForm.item_name,
        department: newItemForm.department,
        type: newItemForm.type,
        reorder_level: parseInt(newItemForm.reorder_level) || 10
      });
      alert('Item added!');
      setNewItemForm({ next_code: '', item_name: '', department: '', type: '', reorder_level: 10 });
      const res = await axios.get('http://127.0.0.1:5000/next_item_code');
      setNewItemForm(prev => ({ ...prev, next_code: res.data.next_code }));
      fetchItems();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSingleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/add_sale', { item_id: selectedSaleItemId, quantity_sold: parseInt(quantitySold) });
      alert('Sale added!');
      setQuantitySold(''); setSelectedSaleItemId('');
      fetchInventorySales(selectedItemId); fetchInventory();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const handleBulkSaleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select a file');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('http://127.0.0.1:5000/bulk_sales_upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Bulk sales added!');
      setFile(null);
      fetchInventorySales(selectedItemId); fetchInventory();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem.item_id) return alert('Select an item');
    try {
      await axios.post('http://127.0.0.1:5000/add_inventory', { ...addForm, item_id: selectedItem.item_id });
      alert('Stock added!');
      fetchExpiry(); fetchInventory();
      setAddForm({ stock_quantity: '', expire_date: '', supplier: '', batch_number: '' });
      setSelectedItem({ item_id: '', name: '' });
      setSelectedDept(''); setSelectedType('');
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
  };

  useEffect(() => {
    let filtered = items;
    if (selectedDept) filtered = filtered.filter(i => i.department === selectedDept);
    if (selectedType) filtered = filtered.filter(i => i.type === selectedType);
    setFilteredItems(filtered);
  }, [selectedDept, selectedType, items]);

  const handleItemSelect = (item) => setSelectedItem({ item_id: item.item_id, name: item.item_name });

  // ──────────────────────── CHARTS ────────────────────────
  const deptStockMap = useMemo(() => {
    const map = {};
    inventoryData.forEach(item => {
      const dept = item.department || 'Unknown';
      map[dept] = (map[dept] || 0) + item.stock_quantity;
    });
    return Object.entries(map);
  }, [inventoryData]);

  const pieData = deptStockMap.length > 0 ? [{
    values: deptStockMap.map(([, stock]) => stock),
    labels: deptStockMap.map(([dept]) => dept),
    type: 'pie',
    marker: { colors: ['#10B37F', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'] },
    textinfo: 'label+percent',
    insidetextorientation: 'radial'
  }] : [];

  const expiryCounts = expiryItems.length > 0
    ? Object.entries(expiryItems.reduce((acc, item) => {
        acc[item.type || 'Unknown'] = (acc[item.type || 'Unknown'] || 0) + 1;
        return acc;
      }, {}))
    : [];

  const barData = [{
    x: expiryCounts.map(([type]) => type),
    y: expiryCounts.map(([, count]) => count),
    type: 'bar',
    marker: { color: '#F59E0B' }
  }];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-stockly-green to-stockly-blue bg-clip-text text-transparent">
            {getGreeting()}, {username}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            You've got <strong>{inventoryData.length}</strong> items in stock.
          </p>
          <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-stockly-green h-2.5 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">70% of monthly goals achieved</p>
        </div>
        <img src={dashboardImg} alt="Welcome" className="w-48 h-48 object-contain" />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <CloudIcon className="h-5 w-5 mr-2 text-blue-500" /> Weather Insights
        </h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={weatherCity}
            onChange={e => setWeatherCity(e.target.value)}
            placeholder="City (e.g., Colombo)"
            className="flex-1 border p-2 rounded"
          />
          <button onClick={fetchWeather} className="btn-primary">Get Forecast</button>
        </div>
        {weather ? (
          <div className="space-y-2">
            <h3 className="font-bold">{weather.city} – {weather.date}</h3>
            <p>🌡️ High: {weather.max_temp}°C | Low: {weather.min_temp}°C</p>
            <p>🌧️ Rain Chance: {weather.rain_prob}%</p>
            <ul className="list-disc pl-5 space-y-1">
              {weather.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-blue-600">{s}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">Click "Get Forecast" for weather-based stocking tips!</p>
        )}
      </div>

      {/* Manager Actions */}
      {role === 'manager' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Inventory */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-stockly-green" /> Quick Add Inventory
            </h2>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="w-full border p-2 rounded">
                <option value="">All Departments</option>
                {[...new Set(items.map(i => i.department))].sort().map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full border p-2 rounded">
                <option value="">All Types</option>
                {[...new Set(items.map(i => i.type))].sort().map(t => <option key={t}>{t}</option>)}
              </select>
              <select onChange={e => {
                const val = e.target.value;
                const item = filteredItems.find(i => `${i.item_name} (${i.item_code})` === val);
                if (item) handleItemSelect(item);
              }} className="w-full border p-2 rounded">
                <option>Select Item ({filteredItems.length})</option>
                {filteredItems.map(i => <option key={i.item_id}>{i.item_name} ({i.item_code})</option>)}
              </select>
              <input type="number" name="stock_quantity" placeholder="Quantity" value={addForm.stock_quantity} onChange={e => setAddForm({ ...addForm, stock_quantity: e.target.value })} required className="w-full border p-2 rounded" />
              <input type="date" name="expire_date" value={addForm.expire_date} onChange={e => setAddForm({ ...addForm, expire_date: e.target.value })} required className="w-full border p-2 rounded" />
              <input type="text" name="supplier" placeholder="Supplier (opt)" value={addForm.supplier} onChange={e => setAddForm({ ...addForm, supplier: e.target.value })} className="w-full border p-2 rounded" />
              <input type="text" name="batch_number" placeholder="Batch (opt)" value={addForm.batch_number} onChange={e => setAddForm({ ...addForm, batch_number: e.target.value })} className="w-full border p-2 rounded" />
              <button type="submit" className="btn-primary w-full">Add Stock</button>
            </form>
          </div>

          {/* Add Sales */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-stockly-blue" /> Add Sales
            </h2>
            <form onSubmit={handleSingleSaleSubmit} className="space-y-3 mb-4">
              <select value={selectedSaleItemId} onChange={e => setSelectedSaleItemId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Select Item</option>
                {items.map(i => <option key={i.item_id} value={i.item_id}>{i.item_name} ({i.item_code})</option>)}
              </select>
              <input type="number" value={quantitySold} onChange={e => setQuantitySold(e.target.value)} placeholder="Qty Sold" required className="w-full border p-2 rounded" />
              <button type="submit" className="btn-primary w-full">Add Sale</button>
            </form>
            <form onSubmit={handleBulkSaleSubmit}>
              <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files[0])} className="mb-2 w-full" />
              <button type="submit" className="btn-primary w-full">Upload Bulk</button>
            </form>
          </div>

          {/* Add New Item */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-stockly-green" /> Add New Item
            </h2>
            <form onSubmit={handleNewItemSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Code</label>
                <div className="bg-gray-100 border border-gray-300 text-gray-800 font-mono p-2 rounded text-center">
                  {newItemForm.next_code || 'Loading...'}
                </div>
              </div>
              <input name="item_name" value={newItemForm.item_name} onChange={handleNewItemChange} placeholder="Item Name" required className="w-full border p-2 rounded" />
              <select name="department" value={newItemForm.department} onChange={handleNewItemChange} required className="w-full border p-2 rounded">
                <option value="">Select Department</option>
                {[...new Set(items.map(i => i.department))].sort().map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select name="type" value={newItemForm.type} onChange={handleNewItemChange} required className="w-full border p-2 rounded">
                <option value="">Select Type</option>
                {[...new Set(items.map(i => i.type))].sort().map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
              <input type="number" name="reorder_level" value={newItemForm.reorder_level} onChange={handleNewItemChange} placeholder="Reorder Level" className="w-full border p-2 rounded" />
              <button type="submit" className="btn-primary w-full">Add Item</button>
            </form>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Sales Trends (Last 12 Months)</h2>
        <input 
          type="text" 
          placeholder="Search by Item ID or Name" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} 
          className="mb-4 p-2 border rounded w-full"
        />
        <select onChange={(e) => setSelectedItemId(e.target.value)} className="mb-4 p-2 border rounded">
          <option value="">Select Item for Trends</option>
          {items
            .filter(item => 
              item.item_id.toString().includes(searchTerm) || 
              item.item_name.toLowerCase().includes(searchTerm)
            )
            .map(item => (
              <option key={item.item_id} value={item.item_id}>
                {item.item_name} (ID {item.item_id}, {item.department})
              </option>
            ))}
        </select>
        {salesData.length > 0 ? (
          <div className="h-80 w-full flex-1">
            <Plot
              data={[{
                x: salesData.map(d => d.name),
                y: salesData.map(d => d.quantity),
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: '#8B5CF6' },
                line: { color: '#8B5CF6', width: 2 }
              }]}
              layout={{
                title: 'Sales Quantity Over Time',
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
          <p className="text-gray-500">Select an item to view trends.</p>
        )}
      </div>
      {/* Expiry List, Dead Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Stock Distribution Pie */}
        <div className="card flex-1">
          <h2 className="text-xl font-semibold mb-4">Stock Distribution by Department</h2>
          {deptStockMap.length > 0 ? (
            <div className="h-80 w-full flex-1">
              <Plot
                data={pieData}
                layout={{
                  title: 'Total Stock by Department',
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

        {/* Expiry by Type Bar */}
        <div className="card flex-1">
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

      {/* Reorder Alerts */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Reorder Alerts</h2>
        {inventoryData.filter(item => item.stock_quantity <= item.reorder_level).length === 0 ? (
          <p className="text-gray-500">No items need reordering.</p>
        ) : (
          <ul className="space-y-2">
            {inventoryData.filter(item => item.stock_quantity <= item.reorder_level).map((item, index) => (
              <li key={index} className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                <div>{item.product_name}: Stock {item.stock_quantity} ≤ Reorder Level {item.reorder_level}</div> {/* FIXED: Use ≤ symbol */}
                <div className="text-sm text-purple-600">Suggest ordering {item.reorder_quantity} units.</div>
              </li>
            ))}
          </ul>
        )}
        <button onClick={fetchInventory} className="mt-4 text-purple-600 underline">Refresh</button>
      </div>
    </div>
  );
}