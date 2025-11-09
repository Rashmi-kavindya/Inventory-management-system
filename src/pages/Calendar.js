// src/pages/Calendar.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Calendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-6">
      <h1 className="text-4xl font-bold text-center text-purple-700 dark:text-purple-400 mb-10">Event Calendar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">{event.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{new Date(event.date).toLocaleDateString()}</p>
            <p className="text-gray-500 dark:text-gray-300">{event.description}</p>
          </div>
        ))}
      </div>
      <button className="mt-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition">
        Add New Event
      </button>
    </div>
  );
}