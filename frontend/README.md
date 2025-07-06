# Air Pollution Monitor - Frontend

A modern React-based frontend for the AI-Powered Air Pollution Monitoring and Forecasting Platform.

## Features

- 🌍 **Real-time Air Quality Monitoring** - Live AQI data with pollutant breakdown
- 🗺️ **Interactive Map** - Visualize air quality data on an interactive map
- 📊 **AI-Powered Forecasting** - 24-hour air quality predictions
- 📈 **Historical Trends** - 7-day historical data visualization
- 🔍 **Location Search** - Search and select any city worldwide
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Beautiful Material-UI based interface
- ⚡ **Real-time Updates** - Auto-refresh data every 5 minutes

## Tech Stack

- **React 18** - Modern React with hooks
- **Material-UI (MUI)** - Component library for beautiful UI
- **React Query** - Data fetching and caching
- **Recharts** - Data visualization charts
- **React Leaflet** - Interactive maps
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AirQualityCard.js
│   ├── AirQualityMap.js
│   ├── ForecastChart.js
│   ├── Header.js
│   ├── HistoricalChart.js
│   └── LocationSearch.js
├── pages/              # Page components
│   └── Dashboard.js
├── services/           # API services
│   └── api.js
├── App.js             # Main app component
├── index.js           # App entry point
└── index.css          # Global styles
```

## Components Overview

### AirQualityCard
Displays current air quality index with pollutant details and health recommendations.

### AirQualityMap
Interactive map showing air quality data with color-coded markers and monitoring areas.

### ForecastChart
24-hour air quality forecast visualization using area charts.

### HistoricalChart
7-day historical trend analysis with multiple pollutant lines.

### LocationSearch
Location search with autocomplete and current location detection.

### Header
Navigation header with notifications and user settings.

## API Integration

The frontend integrates with the backend API for:
- Real-time air quality data
- AI-powered forecasts
- Historical data
- Location search
- User preferences
- Alert management

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

### Code Style

The project uses:
- ESLint for code linting
- Prettier for code formatting
- Material-UI for consistent styling

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deploy to Vercel/Netlify

1. Connect your repository to Vercel or Netlify
2. Set the build command to `npm run build`
3. Set the output directory to `build`
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 