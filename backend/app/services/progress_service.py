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
from app.services.ai_service import AIService


class ProgressService:
    def __init__(self, database):
        self.db = database
        self.submissions_collection = database.submissions
        self.progress_collection = database.progress
        self.user_service = UserService(database)
        self.daily_goal_service = DailyGoalService(database)
        self.ai_service = AIService(database)
    
    async def process_submission(
        self, 
        user_id: str, 
        question_id: str, 
        code: str, 
        language: str = "python"
    ) -> SubmissionResponse:
        """Process a code submission and update progress"""
        from app.models.schemas import SubmissionStatus
        
        # 1. Real AI-powered evaluation
        eval_result = await self.ai_service.evaluate_solution(question_id, code, language)
        is_correct = eval_result.get("is_correct", False)
        ai_feedback = eval_result.get("feedback", "No feedback available.")
        
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
            "ai_hint_used": False,
            "ai_feedback": ai_feedback,
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
        # 1. Update user stats (streak and total solves) - ALWAYS do this
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Count ALL solved today to determine if it's the first success today
        all_solved_today_count = await self.submissions_collection.count_documents({
            "user_id": user_id,
            "status": "solved",
            "submitted_at": {"$gte": today_start}
        })
        is_first_solve_today = (all_solved_today_count == 1)
        
        # Count all-time solves for THIS question to see if it's a new unique one
        solves_for_this_question = await self.submissions_collection.count_documents({
            "user_id": user_id,
            "question_id": question_id,
            "status": "solved"
        })
        is_new_unique_solve = (solves_for_this_question == 1)
        
        # Update user stats
        await self.user_service.update_user_stats(user_id, is_first_solve_today, is_new_unique_solve)
        
        # Update daily goal
        await self.daily_goal_service.mark_problem_completed(user_id)

        # 2. Update Topic Progress (Requires question to be in local DB)
        question = None
        try:
            if len(question_id) == 24 and all(c in '0123456789abcdefABCDEF' for c in question_id):
                question = await self.db.questions.find_one({"_id": ObjectId(question_id)})
        except:
            pass
            
        if not question:
            question = await self.db.questions.find_one({
                "$or": [
                    {"_id": question_id},
                    {"question_id": question_id},
                    {"slug": question_id}
                ]
            })

        if not question:
            return
        
        topic_id = question["topic_id"]
        
        # Update topic progress record
        progress = await self.progress_collection.find_one({
            "user_id": user_id,
            "topic_id": topic_id
        })
        
        if progress:
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
        
    async def get_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get enhanced dashboard data for a user"""
        user = await self.user_service.get_user_with_sync(user_id)
        if not user:
            raise ValueError("User not found")
        
        # 0. Sync check already happened in get_user_with_sync
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # 1. Daily goal info (Now includes live verification)
        daily_goal = await self.daily_goal_service.get_today_goal(user_id)
        
        # 2. Today's solved count from the goal record
        today_solved = daily_goal.completed_problems
        
        # 3. Topic completion & logic
        topic_progress = await self.get_topic_progress_with_names(user_id)
        
        # 4. Weak topics (Accuracy < 60%)
        weak_topics = await self.get_weak_topics(user_id)
        
        # 5. Recent activity
        recent_activity = await self.get_recent_activity(user_id, limit=5)
        
        # 6. Real-time Total Solved Count (Count unique solved question_ids)
        distinct_solved = await self.submissions_collection.distinct(
            "question_id", 
            {"user_id": user_id, "status": "solved"}
        )
        total_solved = len(distinct_solved)
        
        # Optional: Sync user doc if different
        if total_solved != user.total_solved:
            await self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"total_solved": total_solved}}
            )

        return {
            "streak": user.current_streak,
            "total_solved": total_solved,
            "today_progress": today_solved,
            "daily_goal": daily_goal.target_problems if daily_goal else 3,
            "completion_percentage": self._calculate_overall_completion(topic_progress),
            "topic_progress": topic_progress,
            "weak_topics": weak_topics,
            "recent_activity": recent_activity
        }

    async def get_topic_progress_with_names(self, user_id: str) -> List[Dict[str, Any]]:
        """Get topic progress joined with topic details - robust to ID types"""
        # First get all progress for user
        cursor = self.progress_collection.find({"user_id": user_id})
        progress_items = await cursor.to_list(length=100)
        
        results = []
        for p in progress_items:
            # Find topic by ID or Slug
            topic_id = p["topic_id"]
            topic = None
            try:
                if len(str(topic_id)) == 24:
                    topic = await self.db.topics.find_one({"_id": ObjectId(topic_id)})
            except: pass
            
            if not topic:
                topic = await self.db.topics.find_one({"slug": topic_id})
                
            results.append({
                "topic_id": str(topic_id),
                "name": topic["name"] if topic else "Unknown Topic",
                "questions_solved": p.get("questions_solved", 0),
                "total_questions": p.get("total_questions", 1),
                "percentage": (p.get("questions_solved", 0) / p.get("total_questions", 1)) * 100
            })
        return results

    async def get_weak_topics(self, user_id: str) -> List[Dict[str, Any]]:
        """Identify topics where success rate < 60% - robust version"""
        # Get all submissions for user
        cursor = self.submissions_collection.find({"user_id": user_id})
        submissions = await cursor.to_list(length=500)
        
        if not submissions:
            return []
            
        topic_stats = {} # topic_id -> {total, solved}
        
        for s in submissions:
            q_id = s["question_id"]
            # Find question to get its topic
            question = await self.db.questions.find_one({"$or": [{"_id": q_id}, {"slug": q_id}, {"question_id": q_id}]})
            if not question: continue
            
            t_id = question["topic_id"]
            if t_id not in topic_stats:
                topic_stats[t_id] = {"total": 0, "solved": 0}
            
            topic_stats[t_id]["total"] += 1
            if s.get("status") == "solved":
                topic_stats[t_id]["solved"] += 1
                
        results = []
        for t_id, stats in topic_stats.items():
            accuracy = (stats["solved"] / stats["total"])
            if accuracy < 0.6:
                topic = await self.db.topics.find_one({"$or": [{"_id": t_id}, {"slug": t_id}]})
                results.append({
                    "name": topic["name"] if topic else "Unknown",
                    "accuracy": accuracy * 100,
                    "total_attempts": stats["total"]
                })
        
        return results

    async def get_detailed_progress(self, user_id: str) -> Dict[str, Any]:
        """Get detailed learning progress and roadmap for the Progress screen"""
        print(f"DEBUG: get_detailed_progress called for user {user_id}")
        user = await self.user_service.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
            
        # 1. Total solved count
        total_solved = user.total_solved
        
        # 2. Get topic progress
        topic_progress = await self.get_topic_progress_with_names(user_id)
        
        # 3. Calculate accuracy
        total_submissions = await self.submissions_collection.count_documents({"user_id": user_id})
        solved_submissions = await self.submissions_collection.count_documents({
            "user_id": user_id,
            "status": "solved"
        })
        accuracy = (solved_submissions / total_submissions * 100) if total_submissions > 0 else 0
        
        # 4. Mock Roadmap phases (matched to Progressive Learning phases)
        phases = [
            {
                "name": "Phase 1: Foundation",
                "description": "Master basic data structures and logic",
                "completed": total_solved >= 5,
                "topics": [
                    {
                        "name": "Arrays", 
                        "completed": any(t["name"] == "Arrays" and t["percentage"] >= 100 for t in topic_progress),
                        "progress": next((t["percentage"] for t in topic_progress if t["name"] == "Arrays"), 0)
                    },
                    {
                        "name": "Strings", 
                        "completed": any(t["name"] == "Strings" and t["percentage"] >= 100 for t in topic_progress),
                        "progress": next((t["percentage"] for t in topic_progress if t["name"] == "Strings"), 0)
                    }
                ]
            },
            {
                "name": "Phase 2: Linked Structures",
                "description": "Lists, Stacks, and Queues",
                "completed": total_solved >= 15,
                "topics": [
                    {
                        "name": "Linked List", 
                        "completed": any(t["name"] == "Linked List" and t["percentage"] >= 100 for t in topic_progress),
                        "progress": next((t["percentage"] for t in topic_progress if t["name"] == "Linked List"), 0)
                    },
                    {"name": "Stack", "completed": False, "progress": 0},
                    {"name": "Queue", "completed": False, "progress": 0}
                ]
            },
            {
                "name": "Phase 3: Trees & Graphs",
                "description": "Non-linear data structures",
                "completed": total_solved >= 30,
                "topics": [
                    {"name": "Trees", "completed": False, "progress": 0},
                    {"name": "Graphs", "completed": False, "progress": 0}
                ]
            }
        ]
        
        # 5. Achievements
        achievements = []
        if total_solved >= 1:
            achievements.append({"name": "First Step", "description": "Solved your first problem!", "icon": "🎓"})
        if user.current_streak >= 3:
            achievements.append({"name": "Consistent Learner", "description": "3-day solving streak!", "icon": "🔥"})
        if total_solved >= 10:
            achievements.append({"name": "DSA Enthusiast", "description": "Solved 10 problems", "icon": "🌟"})
            
        return {
            "phases": phases,
            "totalProblems": 100,
            "solvedProblems": total_solved,
            "accuracy": round(accuracy, 1),
            "streak": user.current_streak,
            "achievements": achievements
        }

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
        """Mock code evaluation for testing - more reliable for user feedback"""
        clean_code = code.strip()
        # Relaxed length requirement to 5 chars (e.g. 'pass' or 'return')
        if len(clean_code) < 5 or "# Write your solution here" in clean_code:
            return False
        # Otherwise, for learning purposes, we treat it as solved
        return True