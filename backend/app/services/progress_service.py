"""
Progress service for managing user progress, submissions, and streaks
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
from bson import ObjectId

from app.models.schemas import (
    SubmissionInDB, SubmissionResponse, 
    ProgressInDB, ProgressResponse,
    DashboardStats
)
from app.services.user_service import UserService
from app.services.daily_goal_service import DailyGoalService


class ProgressService:
    def __init__(self, database):
        self.db = database
        self.submissions_collection = database.submissions
        self.progress_collection = database.progress
        self.user_service = UserService(database)
        self.daily_goal_service = DailyGoalService(database)
    
    async def process_submission(
        self, 
        user_id: str, 
        question_id: str, 
        code: str, 
        language: str = "python"
    ) -> SubmissionResponse:
        """Process a code submission and update progress"""
        from app.models.schemas import SubmissionStatus
        
        # Mock submission evaluation (in real implementation, this would run tests)
        is_correct = self._mock_evaluation(code)
        status = SubmissionStatus.SOLVED if is_correct else SubmissionStatus.ATTEMPTED
        
        # Create submission record
        submission_data = {
            "user_id": user_id,
            "question_id": question_id,
            "code": code,
            "language": language,
            "status": status,
            "test_cases_passed": 3 if is_correct else 1,  # Mock test results
            "total_test_cases": 3,
            "execution_time": 0.05,  # Mock execution time
            "memory_used": 16.0,     # Mock memory usage
            "ai_hint_used": False,   # Track if AI hint was used
            "ai_feedback": None,
            "submitted_at": datetime.utcnow()
        }
        
        result = await self.submissions_collection.insert_one(submission_data)
        submission_data["id"] = str(result.inserted_id)
        
        submission = SubmissionInDB(**submission_data)
        
        # Update user progress if solved
        if is_correct:
            await self._update_progress_on_solve(user_id, question_id)
        
        return SubmissionResponse(**submission.dict())
    
    async def _update_progress_on_solve(self, user_id: str, question_id: str):
        """Update user progress when a question is solved"""
        # Get question details
        question = await self.db.questions.find_one({"_id": ObjectId(question_id)})
        if not question:
            return
        
        topic_id = question["topic_id"]
        
        # Update topic progress
        progress = await self.progress_collection.find_one({
            "user_id": user_id,
            "topic_id": topic_id
        })
        
        if progress:
            # Update existing progress
            await self.progress_collection.update_one(
                {"_id": progress["_id"]},
                {
                    "$inc": {"questions_solved": 1},
                    "$set": {
                        "last_solved_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        else:
            # Create new progress record
            total_questions = await self.db.questions.count_documents({"topic_id": topic_id})
            progress_data = {
                "user_id": user_id,
                "topic_id": topic_id,
                "questions_solved": 1,
                "total_questions": total_questions,
                "last_solved_at": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await self.progress_collection.insert_one(progress_data)
        
        # Update user stats
        solved_today = await self._check_solved_today(user_id)
        await self.user_service.update_user_stats(user_id, solved_today)
        
        # Update daily goal
        await self.daily_goal_service.mark_problem_completed(user_id)
    
    async def _check_solved_today(self, user_id: str) -> bool:
        """Check if user solved any problem today"""
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        today_submission = await self.submissions_collection.find_one({
            "user_id": user_id,
            "status": "solved",
            "submitted_at": {"$gte": today_start}
        })
        
        return today_submission is not None
    
    async def get_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get enhanced dashboard data for a user"""
        user = await self.user_service.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        # 1. Today's solved count
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_solved = await self.submissions_collection.count_documents({
            "user_id": user_id,
            "status": "solved",
            "submitted_at": {"$gte": today_start}
        })
        
        # 2. Daily goal info
        daily_goal = await self.daily_goal_service.get_today_goal(user_id)
        
        # 3. Topic completion & logic
        topic_progress = await self.get_topic_progress_with_names(user_id)
        
        # 4. Weak topics (Accuracy < 60%)
        weak_topics = await self.get_weak_topics(user_id)
        
        # 5. Recent activity
        recent_activity = await self.get_recent_activity(user_id, limit=5)
        
        return {
            "streak": user.current_streak,
            "total_solved": user.total_solved,
            "today_progress": today_solved,
            "daily_goal": daily_goal.target_problems,
            "completion_percentage": self._calculate_overall_completion(topic_progress),
            "topic_progress": topic_progress,
            "weak_topics": weak_topics,
            "recent_activity": [s.dict() for s in recent_activity]
        }

    async def get_topic_progress_with_names(self, user_id: str) -> List[Dict[str, Any]]:
        """Get topic progress joined with topic details"""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$lookup": {
                    "from": "topics",
                    "localField": "topic_id",
                    "foreignField": "id",
                    "as": "topic_info"
                }
            },
            {"$unwind": "$topic_info"},
            {
                "$project": {
                    "topic_id": 1,
                    "name": "$topic_info.name",
                    "questions_solved": 1,
                    "total_questions": 1,
                    "percentage": {
                        "$multiply": [{"$divide": ["$questions_solved", "$total_questions"]}, 100]
                    }
                }
            }
        ]
        cursor = self.progress_collection.aggregate(pipeline)
        return await cursor.to_list(length=100)

    async def get_weak_topics(self, user_id: str) -> List[Dict[str, Any]]:
        """Identify topics where success rate < 60% using aggregation"""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$group": {
                    "_id": "$topic_id",
                    "total_attempts": {"$sum": 1},
                    "solved_count": {
                        "$sum": {"$cond": [{"$eq": ["$status", "solved"]}, 1, 0]}
                    }
                }
            },
            {
                "$project": {
                    "topic_id": "$_id",
                    "accuracy": {"$divide": ["$solved_count", "$total_attempts"]}
                }
            },
            {"$match": {"accuracy": {"$lt": 0.6}}},
            {
                "$lookup": {
                    "from": "topics",
                    "localField": "topic_id",
                    "foreignField": "id",
                    "as": "topic_info"
                }
            },
            {"$unwind": "$topic_info"},
            {
                "$project": {
                    "_id": 0,
                    "name": "$topic_info.name",
                    "accuracy": {"$multiply": ["$accuracy", 100]},
                    "total_attempts": 1
                }
            }
        ]
        cursor = self.submissions_collection.aggregate(pipeline)
        return await cursor.to_list(length=10)

    def _calculate_overall_completion(self, topics_progress: List[Dict[str, Any]]) -> float:
        if not topics_progress: return 0
        total_solved = sum(p["questions_solved"] for p in topics_progress)
        total_qs = sum(p["total_questions"] for p in topics_progress)
        return (total_solved / total_qs * 100) if total_qs > 0 else 0

    async def get_topic_progress(self, user_id: str) -> List[ProgressResponse]:
        """Get progress for all topics"""
        cursor = self.progress_collection.find({"user_id": user_id})
        progress_list = []
        async for progress_data in cursor:
            progress_data["id"] = str(progress_data.pop("_id"))
            progress_list.append(ProgressResponse(**progress_data))
        return progress_list

    async def get_recent_activity(self, user_id: str, limit: int = 10) -> List[SubmissionResponse]:
        """Get recent submission activity"""
        cursor = self.submissions_collection.find({"user_id": user_id}).sort("submitted_at", -1).limit(limit)
        submissions = []
        async for submission_data in cursor:
            submission_data["id"] = str(submission_data.pop("_id"))
            submissions.append(SubmissionResponse(**submission_data))
        return submissions

    def _mock_evaluation(self, code: str) -> bool:
        """Mock code evaluation for testing"""
        import random
        return random.random() > 0.3