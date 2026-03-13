"""
User service for database operations
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
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
        try:
            user_data = await self.collection.find_one({"_id": ObjectId(user_id)})
            if user_data:
                user_data["id"] = str(user_data.pop("_id"))
                return UserInDB(**user_data)
        except:
            pass
        return None

    async def get_user_with_sync(self, user_id: str) -> Optional[UserInDB]:
        """Get user and ensure their streak is synced correctly"""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
            
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_start = today_start - timedelta(days=1)
        
        needs_update = False
        update_data = {}
        
        # 1. Reset streak if missed day
        if user.last_solved_date:
            last_solved_day = user.last_solved_date.replace(hour=0, minute=0, second=0, microsecond=0)
            if last_solved_day < yesterday_start and user.current_streak > 0:
                user.current_streak = 0
                update_data["current_streak"] = 0
                needs_update = True
        
        # 2. Proactive recovery if solved today
        solves_today = await self.db.submissions.count_documents({
            "user_id": user_id,
            "status": "solved",
            "submitted_at": {"$gte": today_start}
        })
        
        if solves_today > 0 and user.current_streak == 0:
            user.current_streak = 1
            update_data["current_streak"] = 1
            needs_update = True
            
        if needs_update:
            await self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
        return user
    
    async def update_user_stats(self, user_id: str, solved_today: bool = False, is_new_solve: bool = False):
        """Update user statistics after solving a problem"""
        now = datetime.utcnow()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = today - timedelta(days=1)
        
        user = await self.get_user_by_id(user_id)
        if not user:
            return

        update_ops: Dict[str, Any] = {"$set": {"updated_at": now}}
        
        # Increment total solved count if it's a new unique problem
        if is_new_solve:
            update_ops["$inc"] = {"total_solved": 1}

        # Streak logic
        if solved_today:
            # Check if we should extend the streak or start a new one
            last_solved = user.last_solved_date
            if last_solved:
                # normalize last_solved to date start for comparison
                last_solved_day = last_solved.replace(hour=0, minute=0, second=0, microsecond=0)
                
                if last_solved_day == yesterday:
                    # Extended streak
                    new_streak = user.current_streak + 1
                    update_ops["$set"]["current_streak"] = new_streak
                elif last_solved_day < yesterday:
                    # Streak broken, new streak starts
                    new_streak = 1
                    update_ops["$set"]["current_streak"] = new_streak
                else: 
                    # Already solved today, don't change streak
                    new_streak = user.current_streak
                    update_ops["$set"]["current_streak"] = new_streak
            else:
                # First time ever solving
                new_streak = 1
                update_ops["$set"]["current_streak"] = new_streak
            
            update_ops["$set"]["last_solved_date"] = now
            
            # Update longest streak if necessary
            if new_streak > user.longest_streak:
                update_ops["$set"]["longest_streak"] = new_streak
        
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            update_ops
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