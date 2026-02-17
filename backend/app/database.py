"""
MongoDB connection using Motor (async)
"""

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Global MongoDB client
client: AsyncIOMotorClient = None

# Database reference
database = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, database
    
    try:
        client = AsyncIOMotorClient(settings.DATABASE_URL)
        database = client.get_database()
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        print(f"❌ Could not connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


async def create_indexes():
    """Create database indexes for better performance"""
    
    # Users collection indexes
    await database.users.create_index("email", unique=True)
    
    # Topics collection indexes
    await database.topics.create_index("slug", unique=True)
    await database.topics.create_index("name")
    
    # Questions collection indexes
    await database.questions.create_index("topic_id")
    await database.questions.create_index("difficulty")
    await database.questions.create_index([("topic_id", 1), ("difficulty", 1)])
    
    # Submissions collection indexes
    await database.submissions.create_index([("user_id", 1), ("question_id", 1)])
    await database.submissions.create_index("user_id")
    await database.submissions.create_index("submitted_at")
    
    # Progress collection indexes
    await database.progress.create_index("user_id", unique=True)
    
    # Daily goals collection indexes
    await database.daily_goals.create_index([("user_id", 1), ("date", 1)], unique=True)
    await database.daily_goals.create_index("user_id")
    
    print("✅ Database indexes created")


def get_database():
    """Get database instance"""
    return database