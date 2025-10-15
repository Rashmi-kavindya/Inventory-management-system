// src/App.js
import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, PlusIcon, ExclamationTriangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import InventoryList from './pages/InventoryList';
import ExpiryAlerts from './pages/ExpiryAlerts';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-purple-600">Stockly</Link>
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                <HomeIcon className="h-5 w-5 mr-2" /> Dashboard
              </Link>
              <Link to="/predict" className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                <ChartBarIcon className="h-5 w-5 mr-2" /> Predict Reorder
              </Link>
              <Link to="/inventory" className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                <PlusIcon className="h-5 w-5 mr-2" /> Inventory
              </Link>
              <Link to="/expiry" className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" /> Expiry Alerts
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMobileMenu} className="p-2 text-gray-700 hover:text-purple-600">
                {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" onClick={toggleMobileMenu}>
                Dashboard
              </Link>
              <Link to="/predict" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" onClick={toggleMobileMenu}>
                Predict Reorder
              </Link>
              <Link to="/inventory" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" onClick={toggleMobileMenu}>
                Inventory
              </Link>
              <Link to="/expiry" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" onClick={toggleMobileMenu}>
                Expiry Alerts
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/expiry" element={<ExpiryAlerts />} />
      </Routes>
    </div>
  );
}

export default App;