# Air Pollution Monitor - Backend

This is the FastAPI backend for the AI-Powered Air Pollution Monitoring and Forecasting Platform.

## Features
- REST API for air quality data
- AI-powered forecasting endpoints
- Integration with external air quality APIs
- Database support (MongoDB Atlas or SQLite)

## Setup

### Option 1: MongoDB Atlas (Recommended for Production)

1. Create a MongoDB Atlas account and cluster
2. Set up database user and network access
3. Set environment variables:
   ```bash
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/air_pollution_tracker?retryWrites=true&w=majority
   USE_LOCAL_DB=false
   ```

### Option 2: Local SQLite Database (Quick Start)

For development or if MongoDB Atlas is not available:

1. Set environment variable:
   ```bash
   USE_LOCAL_DB=true
   ```

2. The app will automatically create a local SQLite database file.

## Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Environment Variables

- `MONGODB_URL`: MongoDB Atlas connection string
- `DATABASE_NAME`: Database name (default: air_pollution_tracker)
- `USE_LOCAL_DB`: Set to "true" to use local SQLite database
- `SECRET_KEY`: JWT secret key for authentication

## Structure
```
backend/
├── app/
│   ├── api/            # API route definitions
│   ├── core/           # Core logic, config, utils
│   ├── models/         # Pydantic models, ML models
│   ├── services/       # Data fetching, ML, notifications
│   └── main.py         # FastAPI entrypoint
├── requirements.txt    # Python dependencies
└── README.md
``` 