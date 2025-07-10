import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.api.air_quality import router as air_quality_router
from app.routes import users, locations, notifications

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="Air Pollution Monitoring API",
    description="AI-powered Air Pollution Monitoring and Forecasting Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://air-pollution-tracker-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(air_quality_router)
app.include_router(users.router)
app.include_router(locations.router)
app.include_router(notifications.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Air Pollution Monitoring API is running"}

@app.get("/mongo-health")
async def mongo_health_check():
    """Check MongoDB connection status"""
    try:
        # Try to get database instance
        db = get_database()
        
        # Try to run a simple command to test connection
        await db.command("ping")
        
        # Get database stats
        stats = await db.command("dbStats")
        
        return {
            "status": "connected",
            "message": "MongoDB is connected and responding",
            "database": db.name,
            "collections": stats.get("collections", 0),
            "documents": stats.get("objects", 0),
            "data_size": stats.get("dataSize", 0)
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "disconnected",
                "message": "MongoDB connection failed",
                "error": str(e)
            }
        )

@app.get("/")
def root():
    return {
        "message": "Welcome to Air Pollution Monitoring API",
        "version": "1.0.0",
        "docs": "/docs"
    } 

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True) 