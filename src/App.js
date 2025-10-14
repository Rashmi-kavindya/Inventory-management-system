// src/App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [predictFormData, setPredictFormData] = useState({
    product_name: '',
    month: '',
    type: '',
    department: ''
  });

  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPredictFormData({ ...predictFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPrediction('');

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict_reorder', predictFormData);
      setPrediction(response.data.predicted_reorder_quantity);
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Network Error');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Stockly - Inventory Prediction</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Predict Next Reorder Quantity</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="product_name" placeholder="Product Name" onChange={handleChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="number" name="month" placeholder="Month (1-12)" onChange={handleChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="text" name="type" placeholder="Type" onChange={handleChange} required className="border p-2 rounded mr-2 mb-2" />
          <input type="text" name="department" placeholder="Department" onChange={handleChange} required className="border p-2 rounded mr-2 mb-2" />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Predict</button>
        </form>

        {prediction && <p className="mt-2 text-green-700 font-semibold">Predicted Reorder Quantity: {prediction}</p>}
        {error && <p className="mt-2 text-red-700 font-semibold">Error: {error}</p>}
      </div>
    </div>
  );
}

export default App;
