from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models.schemas import SkillLevel, RoadmapRequest, RoadmapResponseData, WeeklyPlan, DailyPlan, DifficultyLevel

class RoadmapService:
    @staticmethod
    def generate_roadmap(request: RoadmapRequest) -> RoadmapResponseData:
        topics = [
            {"name": "Arrays", "base_weight": 2},
            {"name": "Strings", "base_weight": 2},
            {"name": "Linked List", "base_weight": 2},
            {"name": "Stack", "base_weight": 1},
            {"name": "Queue", "base_weight": 1},
            {"name": "Trees", "base_weight": 3},
            {"name": "Graphs", "base_weight": 3},
            {"name": "Dynamic Programming", "base_weight": 4},
        ]

        # Adjust weights based on skill level
        if request.skill_level == SkillLevel.BEGINNER:
            # More time on basics
            for t in topics:
                if t["name"] in ["Arrays", "Strings", "Linked List"]:
                    t["base_weight"] += 2
                if t["name"] in ["Graphs", "Dynamic Programming"]:
                    t["base_weight"] = max(1, t["base_weight"] - 2)
        elif request.skill_level == SkillLevel.ADVANCED:
            # Less time on basics, more on complex
            for t in topics:
                if t["name"] in ["Arrays", "Strings"]:
                    t["base_weight"] = 1
                if t["name"] in ["Graphs", "Dynamic Programming"]:
                    t["base_weight"] += 2

        total_weight = sum(t["base_weight"] for t in topics)
        
        # Calculate questions per day (avg 2 questions per hour for beginner, 3 for intermediate, 4 for advanced)
        questions_per_hour = {
            SkillLevel.BEGINNER: 1.5,
            SkillLevel.INTERMEDIATE: 2,
            SkillLevel.ADVANCED: 3
        }[request.skill_level]
        
        daily_questions_count = int(request.daily_hours * questions_per_hour)
        if daily_questions_count < 1: daily_questions_count = 1
        
        total_questions = daily_questions_count * request.target_days
        
        # Assign days to topics
        current_day = 1
        weekly_plan = []
        current_week = 1
        current_week_topics = []
        current_week_daily_plans = []
        
        # Flatten topics into a day-by-day list
        day_topic_map = []
        remaining_days = request.target_days
        
        for i, t in enumerate(topics):
            # Calculate days for this topic
            if i == len(topics) - 1:
                topic_days = remaining_days
            else:
                topic_days = round((t["base_weight"] / total_weight) * request.target_days)
                if topic_days < 1: topic_days = 1
                remaining_days -= topic_days
            
            # Determine difficulty based on skill level and topic complexity
            difficulty = DifficultyLevel.EASY
            if t["name"] in ["Graphs", "Dynamic Programming"] or request.skill_level == SkillLevel.ADVANCED:
                difficulty = DifficultyLevel.MEDIUM
            if (t["name"] == "Dynamic Programming" and request.skill_level == SkillLevel.ADVANCED) or (t["name"] == "Graphs" and request.skill_level == SkillLevel.ADVANCED):
                difficulty = DifficultyLevel.HARD
            
            for _ in range(topic_days):
                day_topic_map.append({
                    "topic": t["name"],
                    "difficulty": difficulty
                })
        
        # Ensure we have exactly target_days
        if len(day_topic_map) > request.target_days:
            day_topic_map = day_topic_map[:request.target_days]
        elif len(day_topic_map) < request.target_days:
            last_topic = day_topic_map[-1] if day_topic_map else {"topic": "General Review", "difficulty": DifficultyLevel.MEDIUM}
            while len(day_topic_map) < request.target_days:
                day_topic_map.append(last_topic)

        # Group into weeks
        for day in range(1, request.target_days + 1):
            topic_info = day_topic_map[day-1]
            
            daily_plan = DailyPlan(
                day=day,
                topic=topic_info["topic"],
                questions_count=daily_questions_count,
                difficulty=topic_info["difficulty"]
            )
            
            current_week_daily_plans.append(daily_plan)
            if topic_info["topic"] not in current_week_topics:
                current_week_topics.append(topic_info["topic"])
            
            if day % 7 == 0 or day == request.target_days:
                weekly_plan.append(WeeklyPlan(
                    week=current_week,
                    topics=current_week_topics,
                    daily_plans=current_week_daily_plans
                ))
                current_week += 1
                current_week_topics = []
                current_week_daily_plans = []
        
        estimated_date = (datetime.now() + timedelta(days=request.target_days)).strftime("%Y-%m-%d")
        
        return RoadmapResponseData(
            weekly_plan=weekly_plan,
            total_days=request.target_days,
            estimated_completion_timeline=f"Completed by {estimated_date}",
            total_questions=total_questions
        )
