// src/pages/Goals.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_BASE = 'http://127.0.0.1:5000';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    item_id: '',
    target: '',
    deadline: '',
  });

  const userId = localStorage.getItem('user_id') || 1;

  const fetchItems = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/items`);
      setItems(response.data);
    } catch (err) {
      console.error('Failed to load items:', err);
      toast.error('Failed to load items');
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/goals`, { 
        headers: { 'user-id': userId },
        params: { user_id: userId }
      });
      setGoals(response.data);
    } catch (err) {
      console.error('Failed to load goals:', err);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchItems();
    fetchGoals();
    const interval = setInterval(fetchGoals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchItems, fetchGoals]);

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setIsEditing(true);
      setEditingId(goal.id);
      setFormData({
        title: goal.title,
        description: goal.description || '',
        item_id: goal.item_id,
        target: goal.target,
        deadline: goal.deadline ? goal.deadline.split(' ')[0] : '',
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({ title: '', description: '', item_id: '', target: '', deadline: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Goal title is required'); return; }
    if (!formData.item_id) { toast.error('Please select a product'); return; }
    if (!formData.target) { toast.error('Target quantity is required'); return; }

    if (isEditing) {
      axios.put(`${API_BASE}/goals/${editingId}`, formData)
        .then(() => { toast.success('Goal updated!'); handleCloseModal(); fetchGoals(); })
        .catch(err => { console.error(err); toast.error('Failed to update goal'); });
    } else {
      axios.post(`${API_BASE}/goals`, formData, { headers: { 'user_id': userId } })
        .then(() => { toast.success('Goal created!'); handleCloseModal(); fetchGoals(); })
        .catch(err => { console.error(err); toast.error('Failed to create goal'); });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this goal?')) {
      axios.delete(`${API_BASE}/goals/${id}`)
        .then(() => { toast.success('Goal deleted!'); fetchGoals(); })
        .catch(err => { console.error(err); toast.error('Failed to delete goal'); });
    }
  };

  const getProgressPercentage = (goal) => {
    const current = goal.current_sales || 0;
    return goal.target > 0 ? Math.min((current / goal.target) * 100, 100) : 0;
  };

  const getStatusColor = (goal) => {
    const progress = getProgressPercentage(goal);
    if (progress >= 100) return 'text-green-600 dark:text-green-400';
    if (progress >= 75) return 'text-blue-600 dark:text-blue-400';
    if (progress >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { text: 'No deadline', color: 'text-gray-600' };
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) return { text: 'Expired', color: 'text-red-600 dark:text-red-400' };
    if (daysRemaining === 0) return { text: 'Today', color: 'text-red-600 dark:text-red-400' };
    if (daysRemaining <= 7) return { text: `${daysRemaining} days left`, color: 'text-orange-600 dark:text-orange-400' };
    return { text: `${daysRemaining} days left`, color: 'text-green-600 dark:text-green-400' };
  };

  const sortedGoals = [...goals].sort((a, b) => {
    const aDeadline = a.deadline ? new Date(a.deadline) : new Date('2099-12-31');
    const bDeadline = b.deadline ? new Date(b.deadline) : new Date('2099-12-31');
    return aDeadline - bDeadline;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Sales Goals</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track and monitor your sales targets by product</p>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2 shadow-lg">
            <PlusIcon className="h-5 w-5" /> New Goal
          </button>
        </div>

        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Goals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{goals.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{goals.filter((g) => (g.current_sales || 0) >= g.target).length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{goals.filter((g) => (g.current_sales || 0) < g.target).length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Progress</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + getProgressPercentage(g), 0) / goals.length) : 0}%</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-md">
              <p className="text-gray-600 dark:text-gray-400">Loading goals...</p>
            </div>
          ) : sortedGoals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-md">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No goals yet. Create one to get started!</p>
              <button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                Create Your First Goal
              </button>
            </div>
          ) : (
            sortedGoals.map((goal) => {
              const progress = getProgressPercentage(goal);
              const deadlineStatus = getDeadlineStatus(goal.deadline);
              return (
                <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border-l-4 border-purple-500 transition hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                        <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">{goal.item_name || `Item #${goal.item_id}`}</span>
                      </div>
                      {goal.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{goal.description}</p>}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-bold ${getStatusColor(goal)}`}>{goal.current_sales || 0} / {goal.target} units</span>
                          <span className={`text-sm font-bold ${getStatusColor(goal)}`}>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div className={`h-3 rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                      </div>
                      {goal.deadline && <p className={`text-sm font-medium ${deadlineStatus.color}`}>📅 {deadlineStatus.text}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => handleOpenModal(goal)} className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition" title="Edit goal">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg hover:bg-red-100 hover:text-red-600 transition" title="Delete goal">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit Sales Goal' : 'Create New Sales Goal'}</h2>
              <button onClick={handleCloseModal} className="text-white hover:bg-white/20 p-2 rounded-lg transition">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Goal Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Increase Coca Cola sales" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Add details about this sales goal..." className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition resize-none h-20" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Select Product *</label>
                <select name="item_id" value={formData.item_id} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" required>
                  <option value="">-- Choose a product --</option>
                  {items.map((item) => (
                    <option key={item.item_id} value={item.item_id}>{item.item_name} (ID: {item.item_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Target Quantity (units) *</label>
                <input type="number" name="target" value={formData.target} onChange={handleInputChange} placeholder="e.g., 1000" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" required min="1" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Deadline</label>
                <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold py-2 px-4 rounded-lg transition">
                  {isEditing ? 'Update Goal' : 'Create Goal'}
                </button>
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}