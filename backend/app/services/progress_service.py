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
    
    async def get_dashboard_data(self, user_id: str) -> DashboardStats:
        """Get dashboard data for a user"""
        # Get user stats
        user = await self.user_service.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Get today's progress
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_progress = await self.submissions_collection.count_documents({
            "user_id": user_id,
            "status": "solved",
            "submitted_at": {"$gte": today_start}
        })
        
        # Get daily goal
        daily_goal = await self.daily_goal_service.get_today_goal(user_id)
        
        # Get topic progress
        topic_progress = await self.get_topic_progress(user_id)
        
        # Get recent activity
        recent_activity = await self.get_recent_activity(user_id, limit=5)
        
        return DashboardStats(
            streak=user.current_streak,
            total_solved=user.total_solved,
            today_progress=today_progress,
            daily_goal=daily_goal.target_problems if daily_goal else 3,
            topic_progress=topic_progress,
            recent_activity=recent_activity
        )
    
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
    
    async def get_detailed_progress(self, user_id: str) -> Dict[str, Any]:
        """Get detailed progress data"""
        # Get user stats
        user = await self.user_service.get_user_by_id(user_id)
        
        # Get topic progress
        topic_progress = await self.get_topic_progress(user_id)
        
        # Get recent submissions
        recent_submissions = await self.get_recent_activity(user_id, limit=20)
        
        # Get submission stats
        total_submissions = await self.submissions_collection.count_documents({"user_id": user_id})
        solved_submissions = await self.submissions_collection.count_documents({
            "user_id": user_id,
            "status": "solved"
        })
        
        return {
            "user_stats": user.dict() if user else None,
            "topic_progress": [p.dict() for p in topic_progress],
            "recent_submissions": [s.dict() for s in recent_submissions],
            "submission_stats": {
                "total": total_submissions,
                "solved": solved_submissions,
                "success_rate": (solved_submissions / total_submissions * 100) if total_submissions > 0 else 0
            }
        }
    
    def _mock_evaluation(self, code: str) -> bool:
        """Mock code evaluation (in real implementation, this would run actual tests)"""
        # Simple mock evaluation - 70% success rate
        import random
        return random.random() > 0.3