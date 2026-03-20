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
  const role = localStorage.getItem('role') || '';
  const canManageGoals = role === 'manager';

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
        headers: { 'user_id': userId },
        params: { user_id: userId }
      });
      const data = response.data;
      const normalized = Array.isArray(data) ? data : (data && Array.isArray(data.goals) ? data.goals : []);
      setGoals(normalized);
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
    if (!canManageGoals) return;
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
    if (!canManageGoals) { toast.error('Only managers can create or edit goals'); return; }
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
    if (!canManageGoals) { toast.error('Only managers can delete goals'); return; }
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
    if (progress >= 100) return 'text-stockly-600 dark:text-stockly-400';
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
    return { text: `${daysRemaining} days left`, color: 'text-stockly-600 dark:text-stockly-400' };
  };

  const goalsList = Array.isArray(goals) ? goals : [];
  const sortedGoals = [...goalsList].sort((a, b) => {
    const aDeadline = a.deadline ? new Date(a.deadline) : new Date('2099-12-31');
    const bDeadline = b.deadline ? new Date(b.deadline) : new Date('2099-12-31');
    return aDeadline - bDeadline;
  });

  return (
    <div className="min-h-screen bg-stockly-50 dark:bg-stockly-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-stockly-900 dark:text-stockly-50">Sales Goals</h1>
            <p className="text-gray-600 dark:text-stockly-200 mt-2">Track and monitor your sales targets by product</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchGoals} className="bg-gray-200 dark:bg-stockly-900 hover:bg-gray-300 dark:hover:bg-stockly-800 text-gray-900 dark:text-stockly-50 font-semibold py-3 px-4 rounded-lg transition">
              Refresh
            </button>
            {canManageGoals && (
              <button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-stockly-green to-stockly-400 hover:from-stockly-400 hover:to-stockly-400 text-slate-900 font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2 shadow-lg hover:shadow-xl">
                <PlusIcon className="h-5 w-5" /> New Goal
              </button>
            )}
          </div>
        </div>

        {goalsList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white dark:bg-stockly-900 rounded-lg p-6 shadow-md border border-stockly-100 dark:border-stockly-800">
              <p className="text-gray-600 dark:text-stockly-200 text-sm font-medium">Total Goals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-stockly-50 mt-2">{goalsList.length}</p>
            </div>
            <div className="bg-white dark:bg-stockly-900 rounded-lg p-6 shadow-md border border-stockly-100 dark:border-stockly-800">
              <p className="text-gray-600 dark:text-stockly-200 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-stockly-600 dark:text-stockly-300 mt-2">{goalsList.filter((g) => g.status === 'completed').length}</p>
            </div>
            <div className="bg-white dark:bg-stockly-900 rounded-lg p-6 shadow-md border border-stockly-100 dark:border-stockly-800">
              <p className="text-gray-600 dark:text-stockly-200 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-300 mt-2">{goalsList.filter((g) => g.status === 'active').length}</p>
            </div>
            <div className="bg-white dark:bg-stockly-900 rounded-lg p-6 shadow-md border border-stockly-100 dark:border-stockly-800">
              <p className="text-gray-600 dark:text-stockly-200 text-sm font-medium">Overdue</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-300 mt-2">{goalsList.filter((g) => g.status === 'overdue').length}</p>
            </div>
            <div className="bg-white dark:bg-stockly-900 rounded-lg p-6 shadow-md border border-stockly-100 dark:border-stockly-800">
              <p className="text-gray-600 dark:text-stockly-200 text-sm font-medium">Avg Progress</p>
              <p className="text-3xl font-bold text-stockly-600 dark:text-stockly-300 mt-2">{goalsList.length > 0 ? Math.round(goalsList.reduce((sum, g) => sum + getProgressPercentage(g), 0) / goalsList.length) : 0}%</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-stockly-900 rounded-lg p-12 text-center shadow-md border border-stockly-100 dark:border-stockly-800">
              <p className="text-gray-600 dark:text-stockly-200">Loading goals...</p>
            </div>
          ) : sortedGoals.length === 0 ? (
            <div className="bg-white dark:bg-stockly-900 rounded-lg p-12 text-center shadow-md border border-stockly-100 dark:border-stockly-800">
              <p className="text-gray-600 dark:text-stockly-200 mb-4">
                {canManageGoals ? 'No goals yet. Create one to get started!' : 'No goals available yet.'}
              </p>
              {canManageGoals && (
                <button onClick={() => handleOpenModal()} className="bg-stockly-400 hover:bg-stockly-500 text-stockly-950 font-semibold py-2 px-4 rounded-lg transition">
                  Create Your First Goal
                </button>
              )}
            </div>
          ) : (
            sortedGoals.map((goal) => {
              const progress = getProgressPercentage(goal);
              const deadlineStatus = getDeadlineStatus(goal.deadline);
              return (
                <div key={goal.id} className="bg-white dark:bg-stockly-900 rounded-lg p-6 shadow-md border-l-4 border-stockly-400 transition hover:shadow-lg hover:border-stockly-500 border border-stockly-100 dark:border-stockly-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-stockly-50">{goal.title}</h3>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          goal.status === 'completed' ? 'bg-stockly-100 text-stockly-800 dark:bg-stockly-800 dark:text-stockly-100' :
                          goal.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                        }`}>{goal.status}</span>
                        <span className="text-sm font-medium px-3 py-1 bg-stockly-100 text-stockly-800 dark:bg-stockly-800 dark:text-stockly-100 rounded-full">{goal.item_name || `Item #${goal.item_id}`}</span>
                      </div>
                      {goal.description && <p className="text-gray-600 dark:text-stockly-200 text-sm mb-3">{goal.description}</p>}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-bold ${getStatusColor(goal)}`}>{goal.current_sales || 0} / {goal.target} units</span>
                          <span className={`text-sm font-bold ${getStatusColor(goal)}`}>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-stockly-800 rounded-full h-3 overflow-hidden">
                          <div className={`h-3 rounded-full transition-all ${progress >= 100 ? 'bg-stockly-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                      </div>
                      {goal.deadline && <p className={`text-sm font-medium ${deadlineStatus.color}`}>Deadline: {deadlineStatus.text}</p>}
                    </div>
                    {canManageGoals && (
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => handleOpenModal(goal)} className="p-2 bg-gray-100 text-gray-600 dark:bg-stockly-800 dark:text-stockly-200 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/40 dark:hover:text-blue-200 transition" title="Edit goal">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(goal.id)} className="p-2 bg-gray-100 text-gray-600 dark:bg-stockly-800 dark:text-stockly-200 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-200 transition" title="Delete goal">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stockly-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto border border-stockly-100">
            <div className="sticky top-0 bg-gradient-to-r from-stockly-400 to-stockly-300 text-stockly-950 px-6 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-stockly-950">{isEditing ? 'Edit Sales Goal' : 'Create New Sales Goal'}</h2>
                <p className="text-xs text-stockly-900/70">Set clear targets and track performance by product</p>
              </div>
              <button onClick={handleCloseModal} className="text-stockly-950 hover:bg-stockly-950/10 p-2 rounded-lg transition">X</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-stockly-50 mb-2">Goal Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Increase Coca Cola sales" className="w-full px-4 py-2.5 border border-gray-300 dark:border-stockly-800 rounded-lg focus:ring-2 focus:ring-stockly-400 focus:border-transparent dark:bg-stockly-800 dark:text-stockly-50 transition" required />
                  <p className="text-xs text-gray-500 mt-1">Keep it specific so the team knows the focus.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-stockly-50 mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Add details about this sales goal..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-stockly-800 rounded-lg focus:ring-2 focus:ring-stockly-400 focus:border-transparent dark:bg-stockly-800 dark:text-stockly-50 transition resize-none h-24" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-stockly-50 mb-2">Select Product *</label>
                  <select name="item_id" value={formData.item_id} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 dark:border-stockly-800 rounded-lg focus:ring-2 focus:ring-stockly-400 focus:border-transparent dark:bg-stockly-800 dark:text-stockly-50 transition" required>
                    <option value="">-- Choose a product --</option>
                    {items.map((item) => (
                      <option key={item.item_id} value={item.item_id}>{item.item_name} (ID: {item.item_id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-stockly-50 mb-2">Target Quantity (units) *</label>
                  <input type="number" name="target" value={formData.target} onChange={handleInputChange} placeholder="e.g., 1000" className="w-full px-4 py-2.5 border border-gray-300 dark:border-stockly-800 rounded-lg focus:ring-2 focus:ring-stockly-400 focus:border-transparent dark:bg-stockly-800 dark:text-stockly-50 transition" required min="1" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-stockly-50 mb-2">Deadline</label>
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 dark:border-stockly-800 rounded-lg focus:ring-2 focus:ring-stockly-400 focus:border-transparent dark:bg-stockly-800 dark:text-stockly-50 transition" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-stockly-400 to-stockly-300 hover:from-stockly-500 hover:to-stockly-400 text-stockly-950 font-semibold py-2.5 px-4 rounded-lg transition shadow-lg hover:shadow-xl">
                  {isEditing ? 'Update Goal' : 'Create Goal'}
                </button>
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-200 dark:bg-stockly-800 hover:bg-gray-300 dark:hover:bg-stockly-700 text-gray-900 dark:text-stockly-50 font-semibold py-2.5 px-4 rounded-lg transition">
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



