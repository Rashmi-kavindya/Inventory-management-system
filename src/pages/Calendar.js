// src/pages/Calendar.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('calendar'); // 'calendar' | 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // February 2026

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  // Simple calendar grid
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const firstDay = new Date(year, currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // Highlight days that have festivals
  const eventDates = new Set(
    events.map(e => new Date(e.date).toISOString().slice(0, 10))
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Festival Calendar</h1>
        <p className="text-center text-gray-600 mb-8">Explore Sri Lankan festivals &amp; cultural celebrations</p>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentMonth(new Date(year, currentMonth.getMonth()-1, 1))} className="text-3xl">←</button>
          <div className="text-2xl font-semibold">{monthName} {year}</div>
          <button onClick={() => setCurrentMonth(new Date(year, currentMonth.getMonth()+1, 1))} className="text-3xl">→</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8 w-fit mx-auto">
          <button onClick={() => setTab('calendar')} className={`px-8 py-3 rounded-xl font-medium ${tab === 'calendar' ? 'bg-white shadow' : ''}`}>Calendar</button>
          <button onClick={() => setTab('list')} className={`px-8 py-3 rounded-xl font-medium ${tab === 'list' ? 'bg-white shadow' : ''}`}>List</button>
        </div>

        {/* CALENDAR VIEW */}
        {tab === 'calendar' && (
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="font-bold py-2">{d}</div>)}
              {days.map((day, i) => (
                <div
                  key={i}
                  className={`h-14 flex flex-col items-center justify-center rounded-2xl text-lg font-medium border-2 ${day && eventDates.has(`${year}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`) ? 'border-orange-500 bg-orange-50' : 'border-transparent'}`}
                >
                  {day}
                  {day && eventDates.has(`${year}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`) && <div className="text-[10px] text-orange-600">Festival</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {tab === 'list' && (
          <div className="space-y-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-3xl shadow p-6 flex gap-6">
                <div className="text-6xl">🎊</div>
                <div>
                  <div className="text-2xl font-bold">{event.name}</div>
                  <div className="text-teal-600 text-xl mt-1">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  <p className="text-gray-600 mt-3 leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}