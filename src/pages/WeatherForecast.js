// src/pages/WeatherForecast.js
import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { CloudIcon } from '@heroicons/react/24/outline';

export default function WeatherForecast() {
  const location = useLocation();
  const initialCity = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('city') || 'Colombo';
  }, [location.search]);

  const [city, setCity] = useState(initialCity);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleFetch = async () => {
    const trimmed = city.trim();
    if (!trimmed) {
      setError('Please enter a city name.');
      setForecast(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(
        `http://127.0.0.1:5000/weather?city=${encodeURIComponent(trimmed)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (data?.error) {
        setError(data.error);
        setForecast(null);
      } else {
        setForecast(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Weather fetch failed.');
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <CloudIcon className="h-6 w-6 text-blue-500" />
          Weather Forecast
        </h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g., Colombo)"
            className="flex-1 border border-gray-300 dark:border-stockly-800 p-2 rounded bg-white dark:bg-stockly-900 text-stockly-900 dark:text-stockly-50"
          />
          <button
            onClick={handleFetch}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Fetching...' : 'Get Forecast'}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-red-600 dark:text-red-300 text-sm">{error}</p>
        )}
        {!error && !forecast && (
          <p className="mt-3 text-gray-500 dark:text-stockly-200 text-sm">
            Enter a city and click Get Forecast to view the next days.
          </p>
        )}
      </div>

      {forecast?.daily?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {forecast.daily.map((day) => (
            <div key={day.date} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg text-stockly-900 dark:text-stockly-50">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </h3>
                <span className="text-xs text-gray-500 dark:text-stockly-200">{forecast.city}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-stockly-200">
                High: {day.max_temp}°C · Low: {day.min_temp}°C
              </p>
              <p className="text-sm text-gray-700 dark:text-stockly-200">
                Rain: {day.rain_mm} mm
              </p>
              {day.suggestions?.length > 0 && (
                <ul className="mt-2 text-sm text-blue-600 dark:text-blue-300 list-disc pl-5 space-y-1">
                  {day.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
