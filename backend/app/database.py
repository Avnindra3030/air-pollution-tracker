from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from typing import Optional

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "air_pollution_tracker")

# Async client for FastAPI
async_client: Optional[AsyncIOMotorClient] = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    global async_client
    async_client = AsyncIOMotorClient(MONGODB_URL)
    print(f"Connected to MongoDB: {MONGODB_URL}")

async def close_mongo_connection():
    """Close MongoDB connection"""
    global async_client
    if async_client:
        async_client.close()
        print("MongoDB connection closed")

def get_database():
    """Get database instance"""
    if async_client is None:
        raise Exception("Database not connected")
    return async_client[DATABASE_NAME]

# Collections
def get_users_collection():
    """Get users collection"""
    return get_database()["users"]

def get_locations_collection():
    """Get saved locations collection"""
    return get_database()["saved_locations"]

def get_air_quality_history_collection():
    """Get air quality history collection"""
    return get_database()["air_quality_history"]

def get_notifications_collection():
    """Get notifications collection"""
    return get_database()["notifications"]

def get_user_settings_collection():
    """Get user settings collection"""
    return get_database()["user_settings"] 