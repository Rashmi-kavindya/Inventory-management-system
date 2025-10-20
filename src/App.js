// src/App.js
import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, PlusIcon, ExclamationTriangleIcon, Bars3Icon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import InventoryList from './pages/InventoryList';
import ExpiryAlerts from './pages/ExpiryAlerts';
import Login from './pages/Login';
import CreateUser from './pages/CreateUser';
// Remove SalesEntry and CreateItem imports

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setRole(localStorage.getItem('role'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setRole('');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <nav className="bg-white shadow-lg fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-purple-600">Stockly</Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                <HomeIcon className="h-5 w-5 mr-2" /> Dashboard
              </Link>
              <Link to="/predict" className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                <ChartBarIcon className="h-5 w-5 mr-2" /> Predict Reorder
              </Link>
              <Link to="/inventory" className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                <PlusIcon className="h-5 w-5 mr-2" /> Inventory List
              </Link>
              <Link to="/expiry" className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" /> Expiry Alerts
              </Link>
              {role === 'manager' && (
                <Link to="/create-user" className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                  <UserPlusIcon className="h-5 w-5 mr-2" /> Create User
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600">
                Logout
              </button>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={toggleMobileMenu} className="p-2 text-gray-700 hover:text-purple-600">
                {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 z-50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" onClick={toggleMobileMenu}>
                Dashboard
              </Link>
              <Link to="/predict" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" onClick={toggleMobileMenu}>
                Predict Reorder
              </Link>
              <Link to="/inventory" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" onClick={toggleMobileMenu}>
                Inventory List
              </Link>
              <Link to="/expiry" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" onClick={toggleMobileMenu}>
                Expiry Alerts
              </Link>
              {role === 'manager' && (
                <Link to="/create-user" className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium" onClick={toggleMobileMenu}>
                  Create User
                </Link>
              )}
              <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="block px-3 py-2 text-gray-700 hover:text-purple-600 font-medium">
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/expiry" element={<ExpiryAlerts />} />
        {role === 'manager' && <Route path="/create-user" element={<CreateUser />} />}
      </Routes>
    </div>
  );
}

export default App;