"""
User service for database operations
"""

from datetime import datetime
from typing import Optional
from bson import ObjectId

from app.models.schemas import UserInDB


class UserService:
    def __init__(self, database):
        self.db = database
        self.collection = database.users
    
    async def create_user(self, user_data: dict) -> UserInDB:
        """Create a new user"""
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        user_data["total_solved"] = 0
        user_data["current_streak"] = 0
        user_data["longest_streak"] = 0
        user_data["last_solved_date"] = None
        
        result = await self.collection.insert_one(user_data)
        user_data["id"] = str(result.inserted_id)
        
        return UserInDB(**user_data)
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email"""
        user_data = await self.collection.find_one({"email": email})
        if user_data:
            user_data["id"] = str(user_data.pop("_id"))
            return UserInDB(**user_data)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID"""
        user_data = await self.collection.find_one({"_id": ObjectId(user_id)})
        if user_data:
            user_data["id"] = str(user_data.pop("_id"))
            return UserInDB(**user_data)
        return None
    
    async def update_user_stats(self, user_id: str, solved_today: bool = False):
        """Update user statistics after solving a problem"""
        update_data = {
            "updated_at": datetime.utcnow(),
            "$inc": {"total_solved": 1}
        }
        
        if solved_today:
            update_data["$inc"]["current_streak"] = 1
            update_data["$set"] = {"last_solved_date": datetime.utcnow().date()}
        
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            update_data
        )
    
    async def update_streak(self, user_id: str, new_streak: int):
        """Update user streak"""
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "current_streak": new_streak,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    async def update_longest_streak(self, user_id: str, longest_streak: int):
        """Update user's longest streak"""
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "longest_streak": longest_streak,
                    "updated_at": datetime.utcnow()
                }
            }
        )