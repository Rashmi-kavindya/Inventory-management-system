// src/pages/SalesEntry.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SalesEntry() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantitySold, setQuantitySold] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/items');
      setItems(response.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/add_sale', { item_id: selectedItemId, quantity_sold: parseInt(quantitySold) });
      alert('Sale added!');
      setQuantitySold('');
      setSelectedItemId('');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select a file');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('http://127.0.0.1:5000/bulk_sales_upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Bulk sales added!');
      setFile(null);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Daily Sales</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Single Sale</h2>
        <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} className="border p-2 rounded">
            <option value="">Select Item</option>
            {items.map(item => (
              <option key={item.item_id} value={item.item_id}>{item.item_name} ({item.item_code})</option>
            ))}
          </select>
          <input
            type="number"
            value={quantitySold}
            onChange={(e) => setQuantitySold(e.target.value)}
            placeholder="Quantity Sold"
            required
            className="border p-2 rounded"
          />
          <button type="submit" className="md:col-span-2 bg-stockly-green text-white p-2 rounded hover:bg-purple-700">Add Sale</button>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Bulk Upload Sales (Excel)</h2>
        <p className="mb-4 text-gray-500">Excel columns: item_id (required), quantity_sold (required), sale_date (optional, YYYY-MM-DD)</p>
        <form onSubmit={handleBulkSubmit}>
          <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />
          <button type="submit" className="bg-stockly-green text-white p-2 rounded hover:bg-purple-700">Upload and Process</button>
        </form>
      </div>
    </div>
  );
}