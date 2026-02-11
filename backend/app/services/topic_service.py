"""
Topic service for database operations
"""

from typing import List, Optional
from bson import ObjectId

from app.models.schemas import TopicInDB, TopicCreate


class TopicService:
    def __init__(self, database):
        self.db = database
        self.collection = database.topics
    
    async def create_topic(self, topic_data: dict) -> TopicInDB:
        """Create a new topic"""
        from datetime import datetime
        
        topic_data["created_at"] = datetime.utcnow()
        topic_data["updated_at"] = datetime.utcnow()
        topic_data["problems_count"] = topic_data.get("problems_count", 0)
        
        result = await self.collection.insert_one(topic_data)
        topic_data["id"] = str(result.inserted_id)
        
        return TopicInDB(**topic_data)
    
    async def get_topics(self, skip: int = 0, limit: int = 100) -> List[TopicInDB]:
        """Get all topics with pagination"""
        cursor = self.collection.find().skip(skip).limit(limit)
        topics = []
        
        async for topic_data in cursor:
            topic_data["id"] = str(topic_data.pop("_id"))
            topics.append(TopicInDB(**topic_data))
        
        return topics
    
    async def get_topic_by_id(self, topic_id: str) -> Optional[TopicInDB]:
        """Get topic by ID"""
        topic_data = await self.collection.find_one({"_id": ObjectId(topic_id)})
        if topic_data:
            topic_data["id"] = str(topic_data.pop("_id"))
            return TopicInDB(**topic_data)
        return None
    
    async def get_topic_by_slug(self, slug: str) -> Optional[TopicInDB]:
        """Get topic by slug"""
        topic_data = await self.collection.find_one({"slug": slug})
        if topic_data:
            topic_data["id"] = str(topic_data.pop("_id"))
            return TopicInDB(**topic_data)
        return None
    
    async def update_problems_count(self, topic_id: str, count: int):
        """Update problems count for a topic"""
        from datetime import datetime
        
        await self.collection.update_one(
            {"_id": ObjectId(topic_id)},
            {
                "$set": {
                    "problems_count": count,
                    "updated_at": datetime.utcnow()
                }
            }
        )