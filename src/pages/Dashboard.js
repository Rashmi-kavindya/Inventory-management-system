// src/pages/Dashboard.js
import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { PlusIcon, ExclamationTriangleIcon, CloudIcon} from '@heroicons/react/24/outline';
import dashboardImg from '../assets/img.png';
import { useExpiry } from '../contexts/ExpiryContext';
import { useCallback } from 'react';

import ChatWidget from '../components/ChatWidget';

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
  const [expiryIndex, setExpiryIndex] = useState(0);
  const [deadIndex, setDeadIndex] = useState(0);
  const [reorderIndex, setReorderIndex] = useState(0);

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

  const [forecastData, setForecastData] = useState([]);

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

  const fetchSalesForecast = async (itemId) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/predict_sales/${itemId}`);
      setForecastData(res.data);
    } catch (err) {
      console.error('Forecast failed:', err);
      setForecastData([]);
    }
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

  const fetchWeather = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `http://127.0.0.1:5000/weather?city=${weatherCity}`
      );
      setWeather(data);
    } catch (err) {
      alert('Weather fetch failed: ' + err.message);
    }
  }, [weatherCity]); // ← only re‑create when city changes

  useEffect(() => {
    // fetchInventorySales(selectedItemId);
    if (selectedItemId) {
      fetchInventorySales(selectedItemId);
      fetchSalesForecast(selectedItemId);
    }
    fetchInventory();
    fetchExpiry();
    fetchDeadStock();
    fetchItems();
    fetchWeather();
  }, [selectedItemId, expiryDays, fetchExpiry, fetchWeather, weatherCity]);

  useEffect(() => {
    // cycle through each alert's item lists every ~1500ms
    const interval = setInterval(() => {
      if (expiryItems && expiryItems.length > 0) setExpiryIndex(i => (i + 1) % expiryItems.length);
      if (deadStock && deadStock.length > 0) setDeadIndex(i => (i + 1) % deadStock.length);
      const rList = inventoryData.filter(item => item.stock_quantity <= item.reorder_level);
      if (rList && rList.length > 0) setReorderIndex(i => (i + 1) % rList.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [expiryItems, deadStock, inventoryData]);

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

  // prepare lists for each alert type and compute current item per type
  const expiryList = expiryItems || [];
  const deadList = deadStock || [];
  const rList = inventoryData.filter(item => item.stock_quantity <= item.reorder_level) || [];

  const expiryCurrent = expiryList.length > 0 ? expiryList[expiryIndex % expiryList.length] : null;
  const deadCurrent = deadList.length > 0 ? deadList[deadIndex % deadList.length] : null;
  const reorderCurrent = rList.length > 0 ? rList[reorderIndex % rList.length] : null;

  return (
    <div className="space-y-8 relative">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Alerts</h2>
          <div className="p-4">
            <div className="mt-2 space-y-3">
              {/* Expiry row */}
              <div className="p-3 rounded border-l-4 border-yellow-400 bg-yellow-50">
                <div className="text-sm font-medium text-gray-700">Expiry</div>
                <div className="font-semibold mt-1">{expiryCurrent ? expiryCurrent.product_name : 'No expiry alerts'}</div>
                {expiryCurrent && <div className="text-sm text-gray-600 mt-1">{expiryCurrent.stock_quantity} units — {expiryCurrent.days_left} days left</div>}
                {expiryCurrent && expiryCurrent.recommended_discount && <div className="text-xs text-purple-600 mt-1">Discount: {expiryCurrent.recommended_discount}%</div>}
              </div>

              {/* Dead stock row */}
              <div className="p-3 rounded border-l-4 border-red-400 bg-red-50">
                <div className="text-sm font-medium text-gray-700">Dead Stock</div>
                <div className="font-semibold mt-1">{deadCurrent ? (deadCurrent.item_name || `Item #${deadCurrent.item_id}`) : 'No dead stock'}</div>
                {deadCurrent && <div className="text-sm text-gray-600 mt-1">{deadCurrent.stock_quantity} units — recent sales: {deadCurrent.recent_sales}</div>}
                {deadCurrent && deadCurrent.recommendation && <div className="text-xs text-purple-600 mt-1">{deadCurrent.recommendation}</div>}
              </div>

              {/* Reorder row */}
              <div className="p-3 rounded border-l-4 border-orange-400 bg-orange-50">
                <div className="text-sm font-medium text-gray-700">Reorder</div>
                <div className="font-semibold mt-1">{reorderCurrent ? (reorderCurrent.product_name || `Item #${reorderCurrent.item_id}`) : 'No reorder alerts'}</div>
                {reorderCurrent && <div className="text-sm text-gray-600 mt-1">Stock: {reorderCurrent.stock_quantity} ≤ Reorder: {reorderCurrent.reorder_level}</div>}
                {reorderCurrent && reorderCurrent.reorder_quantity && <div className="text-xs text-purple-600 mt-1">Suggest: {reorderCurrent.reorder_quantity}</div>}
              </div>
            </div>
          </div>
        </div>
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
              data={[
                // Historical
                {
                  x: salesData.map(d => d.name),
                  y: salesData.map(d => d.quantity),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Historical Sales',
                  line: { color: '#8B5CF6', width: 3 },
                  marker: { size: 8 }
                },
                // Forecast
                ...(forecastData.length > 0 ? [{
                  x: forecastData.map(d => d.name),
                  y: forecastData.map(d => d.quantity),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Forecast (Next 3 Months)',
                  line: { color: '#10B981', width: 3, dash: 'dot' },
                  marker: { size: 10, symbol: 'diamond', color: '#10B981' }
                }] : [])
              ]}
              layout={{
                title: 'Sales Trends + AI Forecast',
                xaxis: { title: 'Month/Year' },
                yaxis: { title: 'Units Sold' },
                height: 350,
                legend: { x: 0, y: 1.1, orientation: 'h' },
                margin: { t: 60, b: 50, l: 50, r: 50 },
                hovermode: 'x unified'
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

      {/* Floating Chat Widget – only on Dashboard */}
      <ChatWidget />
    </div>
  );
}