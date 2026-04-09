# 📦 Stockly - Smart Inventory Management System

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A comprehensive inventory management solution built with React, designed to help businesses track stock, manage expiry dates, predict demand, and optimize operations.

## ✨ Features

### 🏠 Dashboard
- Real-time overview of inventory status
- Key metrics and analytics
- Quick access to alerts and notifications

### 📋 Inventory Management
- Complete inventory listing with search and filters
- Add new items with detailed specifications
- Track stock levels, locations, and categories

### 🚨 Smart Alerts
- **Expiry Alerts**: Never miss product expiration dates
- **Restock Alerts**: Automatic notifications for low stock items
- **Deadstock Alerts**: Identify slow-moving inventory

### 📊 Analytics & Insights
- Sales tracking and entry system
- Demand prediction using historical data
- Goal setting and progress monitoring
- Weather-based forecasting for seasonal items

### 🤖 AI-Powered Features
- Bundle suggestions for optimal sales
- Intelligent restocking recommendations
- Predictive analytics for inventory planning

### 👥 User Management
- User creation and authentication
- Role-based access control
- Secure login system

### 📅 Additional Tools
- Calendar integration for scheduling
- Weather forecast integration
- Interactive chat widget for support

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- XAMPP (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stockly.git
   cd stockly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
```

## 📖 Usage

### Getting Started
1. **Login**: Use your credentials to access the system
2. **Dashboard**: Get an overview of your inventory status
3. **Add Items**: Start by adding your products to the inventory
4. **Monitor Alerts**: Keep track of expiry and restock notifications
5. **Analyze Data**: Use the analytics tools to make informed decisions

### Key Workflows
- **Daily Operations**: Check dashboard → Review alerts → Update inventory
- **New Product**: Create Item → Set expiry dates → Add to inventory
- **Sales Management**: Enter sales data → Monitor goals → Generate reports

## 🛠️ Technologies Used

- **Frontend**: React 18, Tailwind CSS
- **Build Tool**: Create React App
- **Styling**: PostCSS, Tailwind CSS
- **State Management**: React Context API
- **Icons & UI**: Custom components with Tailwind
- **Database**: Local storage / API integration ready

## 📸 Screenshots

### Dashboard Overview
![Dashboard](screenshots/dashboard.png)
*Main dashboard showing key metrics and alerts*

### Inventory Management
![Inventory](screenshots/inventory.png)
*Comprehensive inventory listing with filters*

### Analytics & Predictions
![Analytics](screenshots/analytics.png)
*Sales analytics and demand predictions*

*📝 Note: Screenshots will be added soon. Place your images in the `screenshots/` folder.*

## 🎥 Demo Videos

- **Product Tour**: [Watch Video](videos/product-tour.mp4)
- **Setup Guide**: [Watch Video](videos/setup-guide.mp4)
- **Advanced Features**: [Watch Video](videos/advanced-features.mp4)

*📹 Videos will be added to the `videos/` folder for easy access.*

## 📁 Project Structure

```
stockly/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── assets/
│   ├── components/
│   │   └── ChatWidget.jsx
│   ├── contexts/
│   │   └── ExpiryContext.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── InventoryList.js
│   │   ├── ExpiryAlerts.js
│   │   └── ... (other pages)
│   ├── App.js
│   └── index.js
├── build/
├── package.json
└── README.md
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Use Tailwind CSS for styling
- Write clear, concise commit messages
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/stockly/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/stockly/discussions)
- **Email**: support@stockly.com

## 🙏 Acknowledgments

- Built with [Create React App](https://github.com/facebook/create-react-app)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons and components inspired by modern design systems

---

**Made with ❤️ for efficient inventory management**
