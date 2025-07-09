from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from typing import Optional
import certifi
import sqlite3
import json
from datetime import datetime

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "air_pollution_tracker")

# Check if we should use local SQLite as fallback
USE_LOCAL_DB = os.getenv("USE_LOCAL_DB", "false").lower() == "true"

# Async client for FastAPI
async_client: Optional[AsyncIOMotorClient] = None

# Local SQLite database
LOCAL_DB_PATH = "local_database.db"

def get_local_db():
    """Get local SQLite database connection"""
    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_local_database():
    """Initialize local SQLite database with tables"""
    conn = get_local_db()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create saved_locations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            location_name TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create air_quality_history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS air_quality_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_name TEXT NOT NULL,
            aqi INTEGER,
            pm25 REAL,
            pm10 REAL,
            o3 REAL,
            no2 REAL,
            co REAL,
            so2 REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create notifications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create user_settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            aqi_threshold INTEGER DEFAULT 100,
            enable_notifications BOOLEAN DEFAULT TRUE,
            notification_frequency TEXT DEFAULT 'daily',
            preferred_units TEXT DEFAULT 'metric',
            theme TEXT DEFAULT 'light',
            language TEXT DEFAULT 'en',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Local SQLite database initialized")

async def connect_to_mongo():
    """Connect to MongoDB or initialize local database"""
    global async_client
    
    if USE_LOCAL_DB:
        print("📁 Using local SQLite database")
        init_local_database()
        return
    
    try:
        # Add SSL configuration to handle TLS issues
        async_client = AsyncIOMotorClient(
            MONGODB_URL,
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000
        )
        print(f"✅ Connected to MongoDB: {MONGODB_URL}")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("📁 Falling back to local SQLite database")
        init_local_database()

async def close_mongo_connection():
    """Close MongoDB connection"""
    global async_client
    if async_client:
        async_client.close()
        print("MongoDB connection closed")

def get_database():
    """Get database instance"""
    if USE_LOCAL_DB:
        return get_local_db()
    
    if async_client is None:
        raise Exception("Database not connected")
    return async_client[DATABASE_NAME]

# Collections
def get_users_collection():
    """Get users collection"""
    if USE_LOCAL_DB:
        return get_local_db()
    return get_database()["users"]

def get_locations_collection():
    """Get saved locations collection"""
    if USE_LOCAL_DB:
        return get_local_db()
    return get_database()["saved_locations"]

def get_air_quality_history_collection():
    """Get air quality history collection"""
    if USE_LOCAL_DB:
        return get_local_db()
    return get_database()["air_quality_history"]

def get_notifications_collection():
    """Get notifications collection"""
    if USE_LOCAL_DB:
        return get_local_db()
    return get_database()["notifications"]

def get_user_settings_collection():
    """Get user settings collection"""
    if USE_LOCAL_DB:
        return get_local_db()
    return get_database()["user_settings"]

# SQLite-specific helper functions
def sqlite_find_one(table, query, db_conn=None):
    """SQLite equivalent of MongoDB find_one"""
    if db_conn is None:
        db_conn = get_local_db()
    
    cursor = db_conn.cursor()
    
    # Build WHERE clause
    where_clause = " AND ".join([f"{k} = ?" for k in query.keys()])
    values = list(query.values())
    
    sql = f"SELECT * FROM {table} WHERE {where_clause}"
    cursor.execute(sql, values)
    
    result = cursor.fetchone()
    if result:
        return dict(result)
    return None

def sqlite_insert_one(table, data, db_conn=None):
    """SQLite equivalent of MongoDB insert_one"""
    if db_conn is None:
        db_conn = get_local_db()
    
    cursor = db_conn.cursor()
    
    # Remove _id if present (SQLite uses auto-increment)
    if '_id' in data:
        del data['_id']
    
    columns = list(data.keys())
    placeholders = ", ".join(["?" for _ in columns])
    values = list(data.values())
    
    sql = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders})"
    cursor.execute(sql, values)
    
    db_conn.commit()
    return cursor.lastrowid

def sqlite_replace_one(table, query, data, db_conn=None):
    """SQLite equivalent of MongoDB replace_one"""
    if db_conn is None:
        db_conn = get_local_db()
    
    cursor = db_conn.cursor()
    
    # Remove _id if present
    if '_id' in data:
        del data['_id']
    
    # Build SET clause
    set_clause = ", ".join([f"{k} = ?" for k in data.keys()])
    set_values = list(data.values())
    
    # Build WHERE clause
    where_clause = " AND ".join([f"{k} = ?" for k in query.keys()])
    where_values = list(query.values())
    
    sql = f"UPDATE {table} SET {set_clause} WHERE {where_clause}"
    cursor.execute(sql, set_values + where_values)
    
    db_conn.commit()
    return cursor.rowcount > 0

def sqlite_update_one(table, query, update_data, db_conn=None):
    """SQLite equivalent of MongoDB update_one"""
    if db_conn is None:
        db_conn = get_local_db()
    
    cursor = db_conn.cursor()
    
    # Build SET clause
    set_clause = ", ".join([f"{k} = ?" for k in update_data.keys()])
    set_values = list(update_data.values())
    
    # Build WHERE clause
    where_clause = " AND ".join([f"{k} = ?" for k in query.keys()])
    where_values = list(query.values())
    
    sql = f"UPDATE {table} SET {set_clause} WHERE {where_clause}"
    cursor.execute(sql, set_values + where_values)
    
    db_conn.commit()
    return cursor.rowcount > 0

def sqlite_delete_one(table, query, db_conn=None):
    """SQLite equivalent of MongoDB delete_one"""
    if db_conn is None:
        db_conn = get_local_db()
    
    cursor = db_conn.cursor()
    
    # Build WHERE clause
    where_clause = " AND ".join([f"{k} = ?" for k in query.keys()])
    values = list(query.values())
    
    sql = f"DELETE FROM {table} WHERE {where_clause}"
    cursor.execute(sql, values)
    
    db_conn.commit()
    return cursor.rowcount > 0 