"""
Daily goal service for managing daily learning goals and streaks
"""

from datetime import datetime, timedelta
from typing import List, Optional
from bson import ObjectId

from app.models.schemas import DailyGoalInDB, DailyGoalResponse
from app.services.user_service import UserService


class DailyGoalService:
    def __init__(self, database):
        self.db = database
        self.collection = database.daily_goals
        self.user_service = UserService(database)
    
    async def get_today_goal(self, user_id: str) -> DailyGoalResponse:
        """Get or create today's daily goal with live verification"""
        today = datetime.utcnow().date()
        today_start = datetime.combine(today, datetime.min.time())
        
        # 1. Count actual successes today from submissions (live truth)
        actual_solves_today = await self.db.submissions.count_documents({
            "user_id": user_id,
            "status": "solved",
            "submitted_at": {"$gte": today_start}
        })
        
        # 2. Try to find existing goal
        goal_data = await self.collection.find_one({
            "user_id": user_id,
            "date": today_start
        })
        
        if goal_data:
            # Sync if count differs
            if goal_data.get("completed_problems", 0) != actual_solves_today:
                achieved = actual_solves_today >= goal_data["target_problems"]
                await self.collection.update_one(
                    {"_id": goal_data["_id"]},
                    {"$set": {
                        "completed_problems": actual_solves_today,
                        "achieved": achieved,
                        "updated_at": datetime.utcnow()
                    }}
                )
                goal_data["completed_problems"] = actual_solves_today
                goal_data["achieved"] = achieved
                
            goal_data["id"] = str(goal_data.pop("_id"))
            return DailyGoalResponse(**goal_data)
        
        # 3. Create new goal for today
        goal_data = {
            "user_id": user_id,
            "date": today_start,
            "target_problems": 3,
            "completed_problems": actual_solves_today,
            "achieved": actual_solves_today >= 3,
            "streak_extended": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.collection.insert_one(goal_data)
        goal_data["id"] = str(result.inserted_id)
        
        return DailyGoalResponse(**goal_data)
    
    async def mark_problem_completed(self, user_id: str) -> DailyGoalResponse:
        """Mark a problem as completed for today's goal"""
        today_goal = await self.get_today_goal(user_id)
        
        # Update completed count
        updated_count = today_goal.completed_problems + 1
        achieved = updated_count >= today_goal.target_problems
        
        # Update the goal
        await self.collection.update_one(
            {"_id": ObjectId(today_goal.id)},
            {
                "$set": {
                    "completed_problems": updated_count,
                    "achieved": achieved,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Update the goal object
        today_goal.completed_problems = updated_count
        today_goal.achieved = achieved
        today_goal.updated_at = datetime.utcnow()
        
        # If goal achieved and not already extended, update streak
        if achieved and not today_goal.streak_extended:
            await self._update_streak(user_id)
            today_goal.streak_extended = True
        
        return today_goal
    
    async def set_daily_goal(self, user_id: str, target_problems: int) -> DailyGoalResponse:
        """Set a new daily goal"""
        today_goal = await self.get_today_goal(user_id)
        
        # Update target
        await self.collection.update_one(
            {"_id": ObjectId(today_goal.id)},
            {
                "$set": {
                    "target_problems": target_problems,
                    "achieved": today_goal.completed_problems >= target_problems,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Update the goal object
        today_goal.target_problems = target_problems
        today_goal.achieved = today_goal.completed_problems >= target_problems
        today_goal.updated_at = datetime.utcnow()
        
        return today_goal
    
    async def get_goal_history(self, user_id: str, days: int = 7) -> List[DailyGoalResponse]:
        """Get daily goal history for specified number of days"""
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days - 1)
        
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        cursor = self.collection.find({
            "user_id": user_id,
            "date": {"$gte": start_datetime, "$lte": end_datetime}
        }).sort("date", -1)
        
        history = []
        async for goal_data in cursor:
            goal_data["id"] = str(goal_data.pop("_id"))
            history.append(DailyGoalResponse(**goal_data))
        
        return history
    
    async def _update_streak(self, user_id: str):
        """Update user streak when daily goal is achieved"""
        user = await self.user_service.get_user_by_id(user_id)
        if not user:
            return
        
        # Check if yesterday's goal was also achieved
        yesterday = datetime.utcnow().date() - timedelta(days=1)
        yesterday_start = datetime.combine(yesterday, datetime.min.time())
        
        yesterday_goal = await self.collection.find_one({
            "user_id": user_id,
            "date": yesterday_start,
            "achieved": True
        })
        
        # Calculate new streak
        if yesterday_goal:
            new_streak = user.current_streak + 1
        else:
            new_streak = 1  # Reset streak if yesterday wasn't achieved
        
        # Update user streak
        await self.user_service.update_streak(user_id, new_streak)
        
        # Update longest streak if needed
        if new_streak > user.longest_streak:
            await self.user_service.update_longest_streak(user_id, new_streak)
    
    async def calculate_streak(self, user_id: str) -> int:
        """Calculate current streak based on daily goals"""
        # Get last 30 days of goals
        history = await self.get_goal_history(user_id, days=30)
        
        streak = 0
        current_date = datetime.utcnow().date()
        
        # Check backwards from today
        for goal in history:
            goal_date = goal.date.date()
            days_diff = (current_date - goal_date).days
            
            if days_diff == streak and goal.achieved:
                streak += 1
            else:
                break
        
        return streak