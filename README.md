# Air Pollution Monitoring and Forecasting Platform

A comprehensive AI-powered air quality monitoring and forecasting platform built with React frontend and FastAPI backend.

## 🌟 Features

- **Real-time Air Quality Monitoring**: Get current AQI, PM2.5, PM10, O₃, NO₂, CO, and SO₂ levels
- **Indian Cities Coverage**: Browse and search air quality for all major Indian districts and towns
- **Global Coverage**: Monitor air quality for cities worldwide using OpenAQ API
- **24-Hour Forecast**: AI-powered air quality forecasting
- **Historical Data**: 7-day historical air quality trends
- **Interactive Maps**: Visualize air quality data on maps
- **Responsive Design**: Modern UI with Material-UI components

## 🏗️ Architecture

- **Frontend**: React 18 with Material-UI, React Query, and Leaflet maps
- **Backend**: FastAPI with Python
- **Data Source**: OpenAQ API for real-time air quality data
- **Charts**: Recharts for data visualization

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install fastapi uvicorn requests
   ```

3. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
Air Pollution Tracker/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── air_quality.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AirQualityCard.js
│   │   │   ├── AirQualityMap.js
│   │   │   ├── ForecastChart.js
│   │   │   ├── HistoricalChart.js
│   │   │   ├── IndianCitiesBrowser.js
│   │   │   ├── LocationSearch.js
│   │   │   └── Header.js
│   │   ├── pages/
│   │   │   └── Dashboard.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── vercel.json
├── README.md
└── .gitignore
```

## 🔧 API Endpoints

### Air Quality Data
- `GET /api/air-quality/current?lat={lat}&lng={lng}` - Get current air quality
- `GET /api/air-quality/forecast?lat={lat}&lng={lng}` - Get 24-hour forecast
- `GET /api/air-quality/historical?lat={lat}&lng={lng}&days={days}` - Get historical data
- `GET /api/air-quality/indian-cities` - Get list of Indian cities
- `GET /health` - Health check

## 🌍 Indian Cities Coverage

The platform includes comprehensive coverage of Indian districts and towns:

- **28 States & Union Territories**
- **200+ Major Cities and Districts**
- **Search and Filter by State**
- **Real-time Air Quality Data**

### States Covered:
- Delhi NCR (Delhi, Gurgaon, Noida, Faridabad, Ghaziabad)
- Maharashtra (Mumbai, Pune, Nagpur, Thane, Nashik, etc.)
- Karnataka (Bangalore, Mysore, Hubli, Mangalore, etc.)
- Tamil Nadu (Chennai, Coimbatore, Madurai, Salem, etc.)
- West Bengal (Kolkata, Howrah, Durgapur, Asansol, etc.)
- And many more...

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `REACT_APP_API_URL` to your backend URL
3. Deploy

### Backend (Railway/Render/Heroku)
1. Deploy the backend to your preferred platform
2. Update the frontend API URL
3. Configure CORS settings

## 🛠️ Technologies Used

### Frontend
- React 18
- Material-UI (MUI)
- React Query (@tanstack/react-query)
- React Router
- Leaflet (Maps)
- Recharts (Charts)
- Axios (HTTP Client)

### Backend
- FastAPI
- Python 3.8+
- Uvicorn (ASGI Server)
- Requests (HTTP Client)

### APIs
- OpenAQ API (Air Quality Data)

## 📊 Features in Detail

### Main Dashboard
- Real-time air quality monitoring
- Interactive location search
- Air quality maps
- 24-hour forecast charts
- Historical data trends
- Health alerts and recommendations

### Indian Cities Browser
- Comprehensive list of Indian districts and towns
- State-wise filtering
- Search functionality
- One-click air quality viewing
- Organized by states and union territories

### Global Cities
- Worldwide air quality coverage
- Popular cities quick access
- OpenAQ API integration
- Real-time data from global monitoring stations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAQ for providing air quality data
- Material-UI for the beautiful UI components
- React Query for efficient data fetching
- FastAPI for the robust backend framework

---

**Built with ❤️ for better air quality monitoring** 