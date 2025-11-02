// src/App.js
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  HomeIcon, ChartBarIcon, PlusIcon, ExclamationTriangleIcon,
  Bars3Icon, XMarkIcon, UserPlusIcon
} from '@heroicons/react/24/outline';

import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import InventoryList from './pages/InventoryList';
import ExpiryAlerts from './pages/ExpiryAlerts';
import Login from './pages/Login';
import CreateUser from './pages/CreateUser';
import logo from './assets/Logo.png';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const location = useLocation();

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

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-cover pt-16">
      {/* ──────────────────────── NAVBAR ──────────────────────── */}
      <nav className="bg-white shadow-xl fixed top-0 left-0 w-full z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Brand */}
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Stockly Logo" className="h-10 w-10" />
              <Link to="/" className="text-3xl font-bold text-gradient">
                Stockly
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={isActive('/') ? 'navbar-link-active' : 'navbar-link'}
              >
                <HomeIcon className="h-5 w-5 mr-2" /> Dashboard
              </Link>
              <Link
                to="/predict"
                className={isActive('/predict') ? 'navbar-link-active' : 'navbar-link'}
              >
                <ChartBarIcon className="h-5 w-5 mr-2" /> Predict Reorder
              </Link>
              <Link
                to="/inventory"
                className={isActive('/inventory') ? 'navbar-link-active' : 'navbar-link'}
              >
                <PlusIcon className="h-5 w-5 mr-2" /> Inventory List
              </Link>
              <Link
                to="/expiry"
                className={isActive('/expiry') ? 'navbar-link-active' : 'navbar-link'}
              >
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" /> Expiry Alerts
              </Link>
              {role === 'manager' && (
                <Link
                  to="/create-user"
                  className={isActive('/create-user') ? 'navbar-link-active' : 'navbar-link'}
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" /> Create User
                </Link>
              )}
              <button onClick={handleLogout} className="btn-secondary ml-4">
                Logout
              </button>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-700 hover:text-stockly-green transition"
              >
                {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {[
                { to: '/', label: 'Dashboard', icon: HomeIcon },
                { to: '/predict', label: 'Predict Reorder', icon: ChartBarIcon },
                { to: '/inventory', label: 'Inventory List', icon: PlusIcon },
                { to: '/expiry', label: 'Expiry Alerts', icon: ExclamationTriangleIcon },
                ...(role === 'manager' ? [{ to: '/create-user', label: 'Create User', icon: UserPlusIcon }] : [])
              ].map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={toggleMobileMenu}
                  className={`block px-3 py-2 text-gray-700 hover:text-stockly-green font-medium flex items-center rounded-md transition ${isActive(to) ? 'text-stockly-green bg-green-50' : ''}`}
                >
                  <Icon className="h-5 w-5 mr-2" /> {label}
                </Link>
              ))}
              <button
                onClick={() => { handleLogout(); toggleMobileMenu(); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-stockly-green font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ──────────────────────── MAIN CONTENT ──────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/expiry" element={<ExpiryAlerts />} />
          {role === 'manager' && <Route path="/create-user" element={<CreateUser />} />}
        </Routes>
      </main>
    </div>
  );
}

export default App;