# Stockly

<p align="center">
  <img src="./src/assets/Logo.png" alt="Stockly Logo" width="120" />
</p>

<p align="center">
  Smart inventory management for stock, sales, alerts, forecasts, and planning.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=000" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=fff" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Axios-HTTP-5A29E4?style=for-the-badge" alt="Axios" />
  <img src="https://img.shields.io/badge/Plotly.js-Analytics-3F4F75?style=for-the-badge" alt="Plotly.js" />
</p>

## Highlights

- Inventory dashboard with live summaries and charts
- Searchable, sortable inventory list
- Expiry, restock, dead stock, and bundle suggestion views
- Sales entry, bulk upload, and sales forecasting
- Goal tracking for sales targets
- Calendar for holidays and custom events
- Weather forecast integration
- Chatbot assistant with voice input and report generation
- Role-based login and user management
- Dark mode support

## Screenshots

<table>
  <tr>
    <td width="50%" valign="top" align="center">
      <img src="./src/assets/dashboard.jpeg" alt="Dashboard" width="100%" />
      <br />
      <sub><strong>Dashboard</strong></sub>
    </td>
    <td width="50%" valign="top" align="center">
      <img src="./src/assets/bundling.jpeg" alt="Bundle Suggestions" width="94%" />
      <br />
      <sub><strong>Bundle Suggestions</strong></sub>
      <div style="height: 16px;"></div>
      <img src="./src/assets/chatbot_ss.jpeg" alt="Chatbot Assistant" width="80%" />
      <br />
      <sub><strong>Chatbot Assistant</strong></sub>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center">
      <img src="./src/assets/weather.jpeg" alt="Bundle Suggestions" width="100%" />
      <br />
      <sub><strong>Weather Forecast</strong></sub>
    </td>
    <td width="50%" valign="top" align="center">
      <img src="./src/assets/calander.jpeg" alt="Calendar" width="100%" />
      <br />
      <sub><strong>Calendar</strong></sub>
    </td>
  </tr>
</table>

<!-- ## Demo Video

- YouTube: `https://youtu.be/your-demo-video` -->

## About This Project

Stockly was developed as an individual project for the Data Management Project course at my university.

It is a full-stack AI-powered inventory management system designed for supermarkets to provide real-time stock tracking, intelligent demand forecasting, near-expiry alerts, and dead-stock detection.

The application combines a modern React dashboard with a Flask-MySQL backend and an XGBoost machine learning model to reduce waste, prevent stock-outs, and improve profitability. The forecasting model achieved an accuracy of 82.53%.

Key features include role-based access control with JWT authentication, a chatbot with Groq AI fallback, automated bundle suggestions for slow-moving items, weather-aware stocking recommendations, a Sri Lankan holiday calendar for demand planning, sales goal tracking, and PDF report generation.

## Features

### Dashboard
- Quick overview of inventory, alerts, goals, weather, and upcoming events
- Sales trend chart and department-wise stock distribution
- Fast access to alerts and actions from a single screen

### Inventory Management
- Full inventory list with search and sorting
- Add new items with auto-generated item codes
- Track quantity, reorder level, expiry date, department, and type

### Smart Alerts
- Expiry alerts for items close to expiration
- Restock alerts for low-stock items
- Dead stock alerts for slow-moving items
- Bundle suggestions to help move related products

### Sales and Forecasting
- Add single sales entries
- Upload bulk sales data through Excel files
- View historical sales trends
- Predict future sales demand
- Predict reorder quantity for products

### Sales Goals
- Create and manage sales goals
- Track progress against targets
- View completion status and deadlines

### Calendar and Events
- Monthly calendar view
- Custom event creation for managers
- Holiday and upcoming event display
- Edit and delete custom events

### Weather Forecasting
- Search weather by city
- View forecast data and stocking suggestions
- Save the latest forecast for quick reference

### Chat Assistant
- Floating chatbot for inventory help
- Ask about stock, sales, alerts, and reports
- Voice input support in compatible browsers
- Generate and download reports from the chat window

### User Management
- Secure login
- Role-based access control
- Create user functionality for managers
- Profile picture upload and settings

## Tech Stack

- React 19
- React Router
- Axios
- Tailwind CSS
- Plotly.js
- React Hot Toast
- Lucide React
- Heroicons

## Project Structure

```text
stockly/
|-- public/
|-- src/
|   |-- assets/
|   |   |-- dashboard.jpeg
|   |   |-- weather.jpeg
|   |   |-- bundling.jpeg
|   |   |-- calander.jpeg
|   |   `-- chatbot.jpeg
|   |-- components/
|   |   `-- ChatWidget.jsx
|   |-- contexts/
|   |   `-- ExpiryContext.js
|   |-- pages/
|   |   |-- Dashboard.js
|   |   |-- InventoryList.js
|   |   |-- ExpiryAlerts.js
|   |   |-- RestockAlerts.js
|   |   |-- DeadstockAlerts.js
|   |   |-- BundleSuggestions.js
|   |   |-- Goals.js
|   |   |-- Calendar.js
|   |   |-- WeatherForecast.js
|   |   |-- Login.js
|   |   `-- Settings.js
|   |-- App.js
|   `-- index.js
|-- package.json
`-- README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Backend API running at `http://127.0.0.1:5000`

### Install

```bash
git clone https://github.com/your-username/stockly.git
cd stockly
npm install
```

### Run

```bash
npm start
```

Open `http://localhost:3000` in your browser.

### Build

```bash
npm run build
```

## Backend

This repository contains the backend.

- Backend repo: `https://github.com/Rashmi-kavindya/stockly-backend`

## Notes

- The app expects the backend API to be available locally during development.
- Some features depend on backend endpoints, including login, alerts, chatbot responses, weather data, and reports.

## Author

Rashmi Kavindya
