import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

async def test_mongo_connection():
    """Test MongoDB connection with SSL configuration"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    
    try:
        # Test connection with SSL configuration
        client = AsyncIOMotorClient(
            mongodb_url,
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000
        )
        
        # Test the connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database info
        db = client.get_database()
        print(f"✅ Connected to database: {db.name}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_mongo_connection()) 