// src/App.js

import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // State for add inventory form
  const [addFormData, setAddFormData] = useState({
    record_date: '',
    product_id: '',
    product_name: '',
    supplier: '',
    stock_quantity: '',
    reorder_level: '',
    reorder_quantity: '',
    units_sold: '',
    last_sold_date: '',
    last_restock_date: '',
    next_restock_date: '',
  });

  // State for predict form
  const [predictFormData, setPredictFormData] = useState({
    product_name: '',
    supplier: '',
  });

  const [prediction, setPrediction] = useState(null);
  const [addMessage, setAddMessage] = useState('');

  // Handle add form change
  const handleAddChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  // Handle predict form change
  const handlePredictChange = (e) => {
    setPredictFormData({ ...predictFormData, [e.target.name]: e.target.value });
  };

  // Submit add form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/add_inventory', addFormData);
      setAddMessage(response.data.message);
    } catch (error) {
      setAddMessage('Error adding inventory: ' + error.message);
    }
  };

  // Submit predict form
  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/predict_reorder', predictFormData);
      setPrediction(response.data.predicted_reorder_quantity);
    } catch (error) {
      setPrediction('Error predicting: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Stockly - Inventory Management</h1>

      {/* Add Inventory Form */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add Inventory</h2>
        <form onSubmit={handleAddSubmit}>
          <input type="date" name="record_date" placeholder="Record Date" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="text" name="product_id" placeholder="Product ID" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="text" name="product_name" placeholder="Product Name" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="text" name="supplier" placeholder="Supplier" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="number" name="stock_quantity" placeholder="Stock Quantity" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="number" name="reorder_level" placeholder="Reorder Level" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="number" name="reorder_quantity" placeholder="Reorder Quantity" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="number" name="units_sold" placeholder="Units Sold" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="date" name="last_sold_date" placeholder="Last Sold Date" onChange={handleAddChange} className="border p-2 rounded mr-2 mb-2" />
          <input type="date" name="last_restock_date" placeholder="Last Restock Date" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="date" name="next_restock_date" placeholder="Next Restock Date" onChange={handleAddChange} required className="border p-2 rounded mr-2 mb-2" />
          <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Add Inventory</button>
        </form>
        {addMessage && <p className="mt-2">{addMessage}</p>}
      </div>

      {/* Predict Reorder Quantity Form */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Predict Next Reorder Quantity</h2>
        <form onSubmit={handlePredictSubmit}>
          <input type="text" name="product_name" placeholder="Product Name" onChange={handlePredictChange} required className="border p-2 rounded mr-2" />
          <input type="text" name="supplier" placeholder="Supplier" onChange={handlePredictChange} required className="border p-2 rounded mr-2" />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Predict</button>
        </form>
        {prediction && <p className="mt-2">Predicted Reorder Quantity: {prediction}</p>}
      </div>
    </div>
  );
}

export default App;