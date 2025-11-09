// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon, ArchiveBoxIcon, BellAlertIcon,
  UserPlusIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon,
  SunIcon, MoonIcon, ChevronDownIcon, Bars3Icon, XMarkIcon
} from '@heroicons/react/24/outline';

import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import InventoryList from './pages/InventoryList';
import ExpiryAlerts from './pages/ExpiryAlerts';
import CreateUser from './pages/CreateUser';
import Settings from './pages/Settings';
import RestockAlerts from './pages/RestockAlerts';
import DeadstockAlerts from './pages/DeadstockAlerts';
import Login from './pages/Login';
import logo from './assets/Logo - Stockly.png';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || 'User');
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || 'https://via.placeholder.com/40');
  const [isDark, setIsDark] = useState(localStorage.getItem('darkMode') === 'true');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  // Sync profile pic
  useEffect(() => {
    const pic = localStorage.getItem('profilePic');
    if (pic) setProfilePic(pic);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setRole(localStorage.getItem('role'));
    setUsername(localStorage.getItem('username') || 'User');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* NAVBAR */}
      <nav className="bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-900 dark:to-indigo-900 shadow-2xl fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Name */}
            <div className="flex items-center">
              <img src={logo} alt="Stockly" className="h-10 w-10 rounded-lg" />
              <Link to="/" className="ml-3 text-2xl font-bold text-white tracking-wider">Stockly</Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`text-white hover:bg-white/20 px-4 py-2 rounded-lg transition flex items-center gap-2 ${isActive('/') ? 'bg-white/20' : ''}`}>
                <HomeIcon className="h-5 w-5" /> Dashboard
              </Link>
              <Link to="/inventory" className={`text-white hover:bg-white/20 px-4 py-2 rounded-lg transition flex items-center gap-2 ${isActive('/inventory') ? 'bg-white/20' : ''}`}>
                <ArchiveBoxIcon className="h-5 w-5" /> Inventory
              </Link>

              {/* Alerts Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                  className="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <BellAlertIcon className="h-5 w-5" /> Alerts <ChevronDownIcon className="h-4 w-4" />
                </button>
                {isAlertsOpen && (
                  <div className="absolute top-12 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-56">
                    <Link to="/expiry-alerts" onClick={() => setIsAlertsOpen(false)} className="block px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900 transition">Expiry Alerts</Link>
                    <Link to="/restock-alerts" onClick={() => setIsAlertsOpen(false)} className="block px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900 transition">Restock Alerts</Link>
                    <Link to="/deadstock-alerts" onClick={() => setIsAlertsOpen(false)} className="block px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900 transition border-t dark:border-gray-700">Dead Stock Alerts</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Circle */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 text-white hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <img src={profilePic} alt="Profile" className="h-10 w-10 rounded-full ring-2 ring-white object-cover" />
                <span className="hidden lg:block font-medium">{username}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {isProfileOpen && (
                <div className="absolute top-14 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-64">
                  {role === 'manager' && (
                    <Link to="/create-user" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900 transition">
                      <UserPlusIcon className="h-5 w-5" /> Create User
                    </Link>
                  )}
                  <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900 transition">
                    <Cog6ToothIcon className="h-5 w-5" /> Settings
                  </Link>
                  <button
                    onClick={() => { setIsDark(!isDark); setIsProfileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900 transition w-full text-left"
                  >
                    {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <div className="border-t dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white"
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-purple-800 dark:bg-purple-950">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-white hover:bg-white/20 rounded-lg">Dashboard</Link>
              <Link to="/inventory" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-white hover:bg-white/20 rounded-lg">Inventory</Link>
              <div className="space-y-1">
                <div className="px-4 py-3 text-white font-medium">Alerts</div>
                <Link to="/expiry-alerts" onClick={() => setIsMobileMenuOpen(false)} className="block pl-8 pr-4 py-2 text-white/90 hover:bg-white/10">Expiry</Link>
                <Link to="/restock-alerts" onClick={() => setIsMobileMenuOpen(false)} className="block pl-8 pr-4 py-2 text-white/90 hover:bg-white/10">Restock</Link>
                <Link to="/deadstock-alerts" onClick={() => setIsMobileMenuOpen(false)} className="block pl-8 pr-4 py-2 text-white/90 hover:bg-white/10">Dead Stock</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/expiry" element={<ExpiryAlerts />} />
          <Route path="/expiry-alerts" element={<ExpiryAlerts />} />
          <Route path="/restock-alerts" element={<RestockAlerts />} />
          <Route path="/deadstock-alerts" element={<DeadstockAlerts />} />
          <Route path="/settings" element={<Settings />} />
          {role === 'manager' && <Route path="/create-user" element={<CreateUser />} />}
        </Routes>
      </main>
    </div>
  );
}

export default App;