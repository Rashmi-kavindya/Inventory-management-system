// src/pages/InventoryList.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Tiny inline SVG for sort indicator (no external dependency)
const SortIcon = ({ isActive, direction }) => {
  if (!isActive) {
    return (
      <svg className="w-4 h-4 inline ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    );
  }
  return direction === 'asc' ? (
    <svg className="w-4 h-4 inline ml-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-4 h-4 inline ml-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
};

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'item_code', direction: 'asc' });

  // -------------------------------------------------
  // Fetch inventory
  // -------------------------------------------------
  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // -------------------------------------------------
  // Sorting
  // -------------------------------------------------
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFiltered = useMemo(() => {
    let filtered = inventory.filter(item => {
      const term = search.toLowerCase();
      return (
        item.product_name.toLowerCase().includes(term) ||
        item.item_code.toLowerCase().includes(term) ||
        item.department.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term)
      );
    });

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle dates
      if (sortConfig.key === 'expire_date') {
        aVal = aVal ? new Date(aVal) : null;
        bVal = bVal ? new Date(bVal) : null;
        if (!aVal && !bVal) return 0;
        if (!aVal) return 1;
        if (!bVal) return -1;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [inventory, search, sortConfig]);

  return (
    <div className="max-w-full mx-auto py-8 px-4 overflow-x-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory List</h1>

      {/* SEARCH BAR */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, code, department or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>

      {/* RESPONSIVE TABLE */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-purple-50 sticky top-0 z-10">
                <tr>
                  {/* CODE – now has left padding */}
                  <th
                    onClick={() => handleSort('item_code')}
                    className="cursor-pointer pl-6 pr-3 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hover:bg-purple-100"
                  >
                    Code <SortIcon isActive={sortConfig.key === 'item_code'} direction={sortConfig.direction} />
                  </th>
                  <th
                    onClick={() => handleSort('product_name')}
                    className="cursor-pointer px-3 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hover:bg-purple-100"
                  >
                    Product <SortIcon isActive={sortConfig.key === 'product_name'} direction={sortConfig.direction} />
                  </th>
                  <th
                    onClick={() => handleSort('department')}
                    className="cursor-pointer px-3 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hover:bg-purple-100 hidden sm:table-cell"
                  >
                    Dept <SortIcon isActive={sortConfig.key === 'department'} direction={sortConfig.direction} />
                  </th>
                  <th
                    onClick={() => handleSort('type')}
                    className="cursor-pointer px-3 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hover:bg-purple-100 hidden md:table-cell"
                  >
                    Type <SortIcon isActive={sortConfig.key === 'type'} direction={sortConfig.direction} />
                  </th>
                  <th
                    onClick={() => handleSort('stock_quantity')}
                    className="cursor-pointer px-3 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hover:bg-purple-100"
                  >
                    Stock <SortIcon isActive={sortConfig.key === 'stock_quantity'} direction={sortConfig.direction} />
                  </th>
                  <th
                    onClick={() => handleSort('expire_date')}
                    className="cursor-pointer px-3 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hover:bg-purple-100 hidden lg:table-cell"
                  >
                    Expire <SortIcon isActive={sortConfig.key === 'expire_date'} direction={sortConfig.direction} />
                  </th>
                  {/* REORDER – right padding */}
                  <th
                    onClick={() => handleSort('reorder_level')}
                    className="cursor-pointer pr-6 pl-3 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hover:bg-purple-100"
                  >
                    Reorder <SortIcon isActive={sortConfig.key === 'reorder_level'} direction={sortConfig.direction} />
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFiltered.map(item => (
                  <tr key={item.item_id} className="hover:bg-gray-50">
                    <td className="pl-6 pr-3 py-3 font-mono text-sm">{item.item_code}</td>
                    <td className="px-3 py-3 font-medium">{item.product_name}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 hidden sm:table-cell">{item.department}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 hidden md:table-cell">{item.type}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.stock_quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : item.stock_quantity <= item.reorder_level
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.stock_quantity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm hidden lg:table-cell">
                      {item.expire_date ? new Date(item.expire_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="pr-6 pl-3 py-3">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {item.reorder_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REFRESH */}
      <button
        onClick={fetchInventory}
        className="mt-6 bg-stockly-green text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        Refresh List
      </button>
    </div>
  );
}