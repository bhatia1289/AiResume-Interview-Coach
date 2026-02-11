"""
Question service for database operations
"""

from typing import List, Optional
from bson import ObjectId

from app.models.schemas import QuestionInDB, QuestionCreate


class QuestionService:
    def __init__(self, database):
        self.db = database
        self.collection = database.questions
    
    async def create_question(self, question_data: dict) -> QuestionInDB:
        """Create a new question"""
        from datetime import datetime
        
        question_data["created_at"] = datetime.utcnow()
        question_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(question_data)
        question_data["id"] = str(result.inserted_id)
        
        return QuestionInDB(**question_data)
    
    async def get_questions(
        self, 
        topic_id: Optional[str] = None, 
        difficulty: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[QuestionInDB]:
        """Get questions with optional filtering"""
        query = {}
        
        if topic_id:
            query["topic_id"] = topic_id
        
        if difficulty:
            query["difficulty"] = difficulty
        
        cursor = self.collection.find(query).skip(skip).limit(limit)
        questions = []
        
        async for question_data in cursor:
            question_data["id"] = str(question_data.pop("_id"))
            questions.append(QuestionInDB(**question_data))
        
        return questions
    
    async def get_question_by_id(self, question_id: str) -> Optional[QuestionInDB]:
        """Get question by ID"""
        question_data = await self.collection.find_one({"_id": ObjectId(question_id)})
        if question_data:
            question_data["id"] = str(question_data.pop("_id"))
            return QuestionInDB(**question_data)
        return None
    
    async def get_questions_by_topic(self, topic_id: str, skip: int = 0, limit: int = 100) -> List[QuestionInDB]:
        """Get questions by topic ID"""
        cursor = self.collection.find({"topic_id": topic_id}).skip(skip).limit(limit)
        questions = []
        
        async for question_data in cursor:
            question_data["id"] = str(question_data.pop("_id"))
            questions.append(QuestionInDB(**question_data))
        
        return questions
    
    async def count_questions_by_topic(self, topic_id: str) -> int:
        """Count questions by topic ID"""
        return await self.collection.count_documents({"topic_id": topic_id})