# Air Pollution Monitor - Backend

This is the FastAPI backend for the AI-Powered Air Pollution Monitoring and Forecasting Platform.

## Features
- REST API for air quality data
- AI-powered forecasting endpoints
- Integration with external air quality APIs
- Database support (SQLite/PostgreSQL)

## Setup

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