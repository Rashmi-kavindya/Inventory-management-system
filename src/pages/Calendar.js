// src/pages/Calendar.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDaysIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [formData, setFormData] = useState({ name: '', date: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [tab, setTab] = useState('calendar'); // 'calendar' | 'list'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const role = localStorage.getItem('role') || '';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchFestivals = axios.get(`http://127.0.0.1:5000/api/festivals?year=${year}`, { headers });
    const fetchCustom = axios.get('http://127.0.0.1:5000/events', { headers });

    Promise.allSettled([fetchFestivals, fetchCustom]).then((results) => {
      const festivals = results[0].status === 'fulfilled' ? results[0].value.data || [] : [];
      const customs = results[1].status === 'fulfilled' ? results[1].value.data || [] : [];
      setEvents(festivals);
      setCustomEvents(customs);
    }).catch((err) => {
      console.error(err);
      setEvents([]);
      setCustomEvents([]);
    });
  }, [currentMonth, token]);   // re-fetch when user changes month/year

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date) return;
    setSaving(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      if (editingEvent) {
        await axios.put(`http://127.0.0.1:5000/events/${editingEvent.id}`, formData, { headers });
      } else {
        await axios.post('http://127.0.0.1:5000/events', formData, { headers });
      }
      setFormData({ name: '', date: '', description: '' });
      setEditingEvent(null);
      const res = await axios.get('http://127.0.0.1:5000/events', { headers });
      setCustomEvents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Simple calendar grid
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const firstDay = new Date(year, currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // Highlight days that have festivals
  const allEvents = [...events, ...customEvents];
  const eventDates = new Set(
    allEvents.map(e => new Date(e.date).toISOString().slice(0, 10))
  );
  const eventNameByDate = allEvents.reduce((acc, event) => {
    const dateKey = new Date(event.date).toISOString().slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = event.name;
    return acc;
  }, {});
  const eventsByDate = allEvents.reduce((acc, event) => {
    const dateKey = new Date(event.date).toISOString().slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});
  const todayKey = new Date().toISOString().slice(0, 10);
  const selectedDayEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];
  const selectedDateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-stockly-50 dark:bg-stockly-950 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-stockly-900 dark:text-stockly-50 mb-2">Calendar</h1>
        <p className="text-center text-gray-600 dark:text-stockly-200 mb-8">Explore upcoming events &amp; holidays</p>

        {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6 text-stockly-900 dark:text-stockly-100">
            <button onClick={() => setCurrentMonth(new Date(year, currentMonth.getMonth()-1, 1))} className="text-3xl">←</button>
            <div className="text-2xl font-semibold">{monthName} {year}</div>
            <button onClick={() => setCurrentMonth(new Date(year, currentMonth.getMonth()+1, 1))} className="text-3xl">→</button>
          </div>

        {role === 'manager' && (
          <div className="bg-white dark:bg-stockly-900 rounded-3xl shadow p-6 mb-8 border border-stockly-100 dark:border-stockly-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stockly-900 dark:text-stockly-50">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              {editingEvent && (
                <button
                  type="button"
                  onClick={() => { setEditingEvent(null); setFormData({ name: '', date: '', description: '' }); }}
                  className="text-xs font-semibold text-stockly-600 dark:text-stockly-200"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Event name"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-stockly-800 rounded-lg bg-white dark:bg-stockly-900 text-stockly-900 dark:text-stockly-50"
                required
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-stockly-800 rounded-lg bg-white dark:bg-stockly-900 text-stockly-900 dark:text-stockly-50"
                required
              />
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description (optional)"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-stockly-800 rounded-lg bg-white dark:bg-stockly-900 text-stockly-900 dark:text-stockly-50"
              />
              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center rounded-lg bg-stockly-400 px-4 py-2 text-sm font-semibold text-stockly-950 shadow-sm transition hover:bg-stockly-500 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Add Event')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-stockly-900 rounded-xl p-1 mb-8 w-fit mx-auto">
          <button onClick={() => setTab('calendar')} className={`px-8 py-3 rounded-xl font-medium ${tab === 'calendar' ? 'bg-white dark:bg-stockly-800 shadow' : 'text-stockly-900 dark:text-stockly-100'}`}>Calendar</button>
          <button onClick={() => setTab('list')} className={`px-8 py-3 rounded-xl font-medium ${tab === 'list' ? 'bg-white dark:bg-stockly-800 shadow' : 'text-stockly-900 dark:text-stockly-100'}`}>List</button>
        </div>

        {/* CALENDAR VIEW */}
        {tab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-stockly-900 rounded-3xl shadow p-6">
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="font-bold py-2 text-stockly-900 dark:text-stockly-100">{d}</div>)}
                {days.map((day, i) => {
                  const dateKey = day
                    ? `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    : null;
                  const holidayName = dateKey ? eventNameByDate[dateKey] : null;
                  const isToday = dateKey && dateKey === todayKey;
                  const isSelected = dateKey && dateKey === selectedDate;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => dateKey && setSelectedDate(dateKey)}
                      disabled={!day}
                      className={`h-16 flex flex-col items-center justify-center rounded-2xl text-lg font-medium border-2 px-1 transition ${
                        day && eventDates.has(dateKey) ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/25 dark:border-orange-400' : 'border-transparent'
                      } ${
                        isToday ? 'bg-stockly-100 dark:bg-stockly-800 border-stockly-500 text-stockly-900 dark:text-stockly-50' : 'text-stockly-900 dark:text-stockly-100'
                      } ${
                        isSelected ? 'ring-2 ring-stockly-400/70' : ''
                      } ${day ? 'hover:bg-stockly-50 dark:hover:bg-stockly-800/70' : 'cursor-default'}`}
                    >
                      {day}
                      {holidayName && <div className="w-full truncate text-[10px] text-orange-700 dark:text-orange-300">{holidayName}</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-stockly-900 rounded-3xl shadow p-6 border border-stockly-100 dark:border-stockly-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-stockly-900 dark:text-stockly-50">Events on {selectedDateLabel}</h3>
                  <p className="text-sm text-gray-600 dark:text-stockly-200">Holidays and custom events for the selected day.</p>
                </div>
                {selectedDayEvents.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-stockly-100 dark:bg-stockly-800 px-3 py-1 text-xs font-semibold text-stockly-700 dark:text-stockly-100">
                    {selectedDayEvents.length} item{selectedDayEvents.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="text-gray-500 dark:text-stockly-200">No events found for this date.</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => {
                    const isCustom = customEvents.some((e) => e.id === event.id);
                    return (
                      <div key={`${event.id}-${event.name}`} className="flex items-center justify-between rounded-2xl border border-stockly-100 dark:border-stockly-800 bg-stockly-50/70 dark:bg-stockly-900/60 px-4 py-3">
                        <div>
                          <div className="text-base font-semibold text-stockly-900 dark:text-stockly-50">{event.name}</div>
                          {event.description && (
                            <div className="text-sm text-gray-600 dark:text-stockly-200 mt-1">{event.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isCustom ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200'}`}>
                            {isCustom ? 'Event' : 'Holiday'}
                          </span>
                          {role === 'manager' && isCustom && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingEvent(event);
                                  setFormData({
                                    name: event.name || '',
                                    date: event.date ? String(event.date).slice(0, 10) : '',
                                    description: event.description || ''
                                  });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50 dark:border-sky-700/60 dark:bg-stockly-900 dark:text-sky-200"
                              >
                                <PencilSquareIcon className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const headers = token ? { Authorization: `Bearer ${token}` } : {};
                                  await axios.delete(`http://127.0.0.1:5000/events/${event.id}`, { headers });
                                  const res = await axios.get('http://127.0.0.1:5000/events', { headers });
                                  setCustomEvents(res.data || []);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 dark:border-red-700/60 dark:bg-stockly-900 dark:text-red-300"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {tab === 'list' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-semibold text-stockly-900 dark:text-stockly-50 mb-4">Holidays</h2>
              <div className="space-y-6">
                {events.length === 0 && (
                  <p className="text-gray-500 dark:text-stockly-200">No holidays found.</p>
                )}
                {events
                  .slice()
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(event => (
                    <div key={`holiday-${event.id}`} className="bg-white dark:bg-stockly-900 rounded-3xl shadow p-6 flex gap-4 border-l-4 border-l-orange-400">
                      <div className="mt-1 text-orange-500">
                        <CalendarDaysIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-2xl font-bold text-stockly-900 dark:text-stockly-50">{event.name}</div>
                        <div className="text-stockly-600 dark:text-stockly-300 text-xl mt-1">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                        {event.description && <p className="text-gray-600 dark:text-stockly-200 mt-3 leading-relaxed">{event.description}</p>}
                      </div>
                      <div className="shrink-0 self-start rounded-xl bg-orange-50 dark:bg-orange-900/30 px-3 py-2 text-center">
                        <p className="text-[10px] uppercase tracking-wide text-orange-700 dark:text-orange-200">Date</p>
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-100">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-stockly-900 dark:text-stockly-50 mb-4">Events</h2>
              <div className="space-y-6">
                {customEvents.length === 0 && (
                  <p className="text-gray-500 dark:text-stockly-200">No events found.</p>
                )}
                {customEvents
                  .slice()
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(event => (
                    <div key={`event-${event.id}`} className="bg-white dark:bg-stockly-900 rounded-3xl shadow p-6 flex gap-4 border-l-4 border-l-stockly-500">
                      <div className="mt-1 text-stockly-600">
                        <CalendarDaysIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-2xl font-bold text-stockly-900 dark:text-stockly-50">{event.name}</div>
                        <div className="text-stockly-600 dark:text-stockly-300 text-xl mt-1">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                        {event.description && <p className="text-gray-600 dark:text-stockly-200 mt-3 leading-relaxed">{event.description}</p>}
                      </div>
                      <div className="shrink-0 self-start rounded-xl bg-stockly-50 dark:bg-stockly-800 px-3 py-2 text-center">
                        <p className="text-[10px] uppercase tracking-wide text-stockly-700 dark:text-stockly-200">Date</p>
                        <p className="text-sm font-semibold text-stockly-800 dark:text-stockly-100">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      {role === 'manager' && (
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEvent(event);
                              setFormData({
                                name: event.name || '',
                                date: event.date ? String(event.date).slice(0, 10) : '',
                                description: event.description || ''
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50 dark:border-sky-700/60 dark:bg-stockly-900 dark:text-sky-200"
                          >
                            <PencilSquareIcon className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const headers = token ? { Authorization: `Bearer ${token}` } : {};
                              await axios.delete(`http://127.0.0.1:5000/events/${event.id}`, { headers });
                              const res = await axios.get('http://127.0.0.1:5000/events', { headers });
                              setCustomEvents(res.data || []);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 dark:border-red-700/60 dark:bg-stockly-900 dark:text-red-300"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



