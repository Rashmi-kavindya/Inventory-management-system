// src/pages/Dashboard.js
import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import dashboardImg from '../assets/dashboard.png';

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
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username') || 'User';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // For Add Sales (integrated from SalesEntry.js)
  const [selectedSaleItemId, setSelectedSaleItemId] = useState('');
  const [quantitySold, setQuantitySold] = useState('');
  const [file, setFile] = useState(null);

  const handleSingleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/add_sale', { item_id: selectedSaleItemId, quantity_sold: parseInt(quantitySold) });
      alert('Sale added!');
      setQuantitySold('');
      setSelectedSaleItemId('');
      fetchInventorySales(selectedItemId);  // Refresh trends
      fetchInventory();  // Refresh stock
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
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
      fetchInventorySales(selectedItemId);
      fetchInventory();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  // For Add New Item (integrated from CreateItem.js)
  const [newItemForm, setNewItemForm] = useState({ item_code: '', item_name: '', department: '', type: '', reorder_level: 10, reorder_quantity: 50 });

  const handleNewItemChange = (e) => setNewItemForm({ ...newItemForm, [e.target.name]: e.target.value });

  const handleNewItemSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/add_item', newItemForm);
      alert('Item added!');
      setNewItemForm({ item_code: '', item_name: '', department: '', type: '', reorder_level: 10, reorder_quantity: 50 });
      fetchItems();  // Refresh items list
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    fetchInventorySales(selectedItemId);
    fetchInventory();
    fetchExpiry();
    fetchDeadStock();
    fetchItems();
  }, [selectedItemId]);

  useEffect(() => {
    if (items.length > 0) {
      const maxItemCode = Math.max(...items.map(i => parseInt(i.item_code) || 0));
      setNewItemForm(prev => ({ ...prev, item_code: (maxItemCode + 1).toString() }));
    }
  }, [items]);

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

  useEffect(() => {
    let filtered = items;
    if (selectedDept) filtered = filtered.filter(item => item.department === selectedDept);
    if (selectedType) filtered = filtered.filter(item => item.type === selectedType);
    setFilteredItems(filtered);
    setSelectedItem({ item_id: '', name: '' });
  }, [selectedDept, selectedType, items]);

  const handleItemSelect = (item) => {
    setSelectedItem({ item_id: item.item_id, name: item.item_name });
  };

  const handleChange = (e) => setAddForm({ ...addForm, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem.item_id) return alert('Select an item first');
    try {
      await axios.post('http://127.0.0.1:5000/add_inventory', {
        ...addForm,
        item_id: selectedItem.item_id
      });
      alert('Stock added successfully!');
      fetchExpiry();
      fetchInventory();
      setAddForm({ stock_quantity: '', expire_date: '', supplier: '', batch_number: '' });
      setSelectedItem({ item_id: '', name: '' });
      setSelectedDept('');
      setSelectedType('');
    } catch (err) {
      alert('Error adding stock: ' + (err.response?.data?.error || err.message));
    }
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
    } catch (err) {
      console.error('Error fetching inventory sales:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/inventory');
      setInventoryData(response.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const fetchExpiry = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/near_expiry?days=30');
      setExpiryItems(response.data);
    } catch (err) {
      console.error('Error fetching expiry:', err);
    }
  };

  const fetchDeadStock = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/dead_stock?months_back=3');
      setDeadStock(response.data);
    } catch (err) {
      console.error('Error fetching dead stock:', err);
    }
  };

  const deptStockMap = useMemo(() => {
    const map = {};
    inventoryData.forEach(item => {
      const dept = item.department || 'Unknown';
      map[dept] = (map[dept] || 0) + item.stock_quantity;
    });
    return Object.entries(map);
  }, [inventoryData]);

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
      {/* Greeting - Large, modern style */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
            {getGreeting()} {username}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">You've got {inventoryData.length} items in stock. Check your progress below.</p>
          {/* Optional: Add progress bar or badges */}
          <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">70% of monthly goals achieved</p>
        </div>
        <img 
          src={dashboardImg}
          alt="Hi User" 
          className="w-48 h-48 object-contain" 
        />
      </div>
      {/* Manager Sections: Add Inventory, Add Sales, Add New Item */}
      {role === 'manager' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Quick Add Inventory */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><PlusIcon className="h-5 w-5 mr-2" /> Quick Add Inventory</h2>
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 gap-4">
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
              }} className="border p-2 rounded">
                <option value="">Select Item ({filteredItems.length} available)</option>
                {filteredItems.map(item => <option key={item.item_id}>{item.item_name} ({item.item_code})</option>)}
              </select>
              <input type="number" name="stock_quantity" placeholder="Quantity to Add" value={addForm.stock_quantity} onChange={handleChange} required className="border p-2 rounded" />
              <input type="date" name="expire_date" value={addForm.expire_date} onChange={handleChange} required className="border p-2 rounded" />
              <input type="text" name="supplier" placeholder="Supplier (Optional)" value={addForm.supplier} onChange={handleChange} className="border p-2 rounded" />
              <input type="text" name="batch_number" placeholder="Batch Number (Optional)" value={addForm.batch_number} onChange={handleChange} className="border p-2 rounded" />
              <button type="submit" className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Add Stock</button>
            </form>
          </div>

          {/* Add Sales */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><PlusIcon className="h-5 w-5 mr-2" /> Add Sales</h2>
            <form onSubmit={handleSingleSaleSubmit} className="grid grid-cols-1 gap-4 mb-6">
              <select value={selectedSaleItemId} onChange={(e) => setSelectedSaleItemId(e.target.value)} className="border p-2 rounded">
                <option value="">Select Item</option>
                {items.map(item => (
                  <option key={item.item_id} value={item.item_id}>{item.item_name} ({item.item_code})</option>
                ))}
              </select>
              <input type="number" value={quantitySold} onChange={(e) => setQuantitySold(e.target.value)} placeholder="Quantity Sold" required className="border p-2 rounded" />
              <button type="submit" className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Add Single Sale</button>
            </form>
            <h3 className="text-lg font-semibold mb-2">Bulk Upload Sales (Excel)</h3>
            <p className="mb-2 text-gray-500">Columns: item_id, quantity_sold, sale_date (optional)</p>
            <form onSubmit={handleBulkSaleSubmit}>
              <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
              <button type="submit" className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Upload Bulk</button>
            </form>
          </div>

          {/* Add New Item */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><PlusIcon className="h-5 w-5 mr-2" /> Add New Item</h2>
            <form onSubmit={handleNewItemSubmit} className="grid grid-cols-1 gap-4">
              <input 
                name="item_code" 
                value={newItemForm.item_code} 
                onChange={handleNewItemChange} 
                placeholder="Auto-generated (next available)" 
                readOnly 
                className="border p-2 rounded bg-gray-100 cursor-not-allowed" 
              />
              <input 
                name="item_name" 
                value={newItemForm.item_name} 
                onChange={handleNewItemChange} 
                placeholder="Item Name (e.g., New Product)" 
                required 
                className="border p-2 rounded" 
              />
              <select 
                name="department" 
                value={newItemForm.department} 
                onChange={handleNewItemChange} 
                required 
                className="border p-2 rounded"
              >
                <option value="">Select Department</option>
                {[...new Set(items.map(i => i.department))].sort().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select 
                name="type" 
                value={newItemForm.type} 
                onChange={handleNewItemChange} 
                required 
                className="border p-2 rounded"
              >
                <option value="">Select Type</option>
                {[...new Set(items.map(i => i.type))].sort().map(typ => (
                  <option key={typ} value={typ}>{typ}</option>
                ))}
              </select>
              <input 
                type="number" 
                name="reorder_level" 
                value={newItemForm.reorder_level} 
                onChange={handleNewItemChange} 
                placeholder="Reorder Level (e.g., 10 - alert when stock <= this)" 
                className="border p-2 rounded" 
              />
              <input 
                type="number" 
                name="reorder_quantity" 
                value={newItemForm.reorder_quantity} 
                onChange={handleNewItemChange} 
                placeholder="Reorder Quantity (e.g., 50 - suggested order amount)" 
                className="border p-2 rounded" 
              />
              <button type="submit" className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Add Item</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
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
        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
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

      {/* Reorder Alerts */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Reorder Alerts</h2>
        {inventoryData.filter(item => item.stock_quantity <= item.reorder_level).length === 0 ? (
          <p className="text-gray-500">No items need reordering.</p>
        ) : (
          <ul className="space-y-2">
            {inventoryData.filter(item => item.stock_quantity <= item.reorder_level).map((item, index) => (
              <li key={index} className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                <div>{item.product_name}: Stock {item.stock_quantity} {'<='} Reorder Level {item.reorder_level}</div>
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