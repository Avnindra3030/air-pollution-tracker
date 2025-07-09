import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

async def test_new_mongo_connection():
    """Test the new MongoDB Atlas connection"""
    # You can set this temporarily for testing
    # os.environ["MONGODB_URL"] = "your_connection_string_here"
    
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    
    print(f"Testing connection to: {mongodb_url}")
    
    try:
        # Test connection with SSL configuration
        client = AsyncIOMotorClient(
            mongodb_url,
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=15000,
            socketTimeoutMS=15000
        )
        
        # Test the connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database info
        db = client.get_database()
        print(f"✅ Connected to database: {db.name}")
        
        # List collections (will be empty initially)
        collections = await db.list_collection_names()
        print(f"✅ Collections in database: {collections}")
        
        client.close()
        print("✅ Connection test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("Please check:")
        print("1. Your connection string is correct")
        print("2. Network access allows all IPs (0.0.0.0/0)")
        print("3. Username and password are correct")
        return False

if __name__ == "__main__":
    asyncio.run(test_new_mongo_connection()) 