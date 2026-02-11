"""
AI service with mock responses
"""

import random
from typing import List, Dict, Any
from datetime import datetime

from app.models.schemas import AIFeedbackResponse


class AIService:
    def __init__(self, database):
        self.db = database
    
    async def generate_hint(self, question_id: str, context: str, user_id: str) -> str:
        """Generate AI-powered hint for a question (mock implementation)"""
        
        # Mock hint templates based on different patterns
        hint_templates = [
            "Consider using a hash map to store and quickly look up values.",
            "Think about the time complexity - can you optimize it to O(n log n)?",
            "Try using two pointers approach for this problem.",
            "Consider breaking the problem into smaller subproblems.",
            "What if you sort the array first? Would that help?",
            "Consider using dynamic programming for optimal substructure.",
            "Think about edge cases - what happens with empty input?",
            "Try using a stack or queue data structure.",
            "Consider the sliding window technique for this problem.",
            "What if you use recursion with memoization?"
        ]
        
        # Select a random hint based on context
        hint = random.choice(hint_templates)
        
        # Add some variation based on the context
        if "array" in context.lower():
            hint += " Pay special attention to array boundaries."
        elif "tree" in context.lower():
            hint += " Consider tree traversal methods."
        elif "graph" in context.lower():
            hint += " Think about BFS or DFS approaches."
        
        return hint
    
    async def generate_feedback(
        self, 
        question_id: str, 
        code: str, 
        language: str, 
        user_id: str
    ) -> AIFeedbackResponse:
        """Generate AI feedback on code submission (mock implementation)"""
        
        # Mock feedback based on code analysis
        feedback_templates = [
            "Good attempt! Your code shows understanding of the problem.",
            "Nice solution! Consider optimizing for better time complexity.",
            "Great job! Your implementation is clean and readable.",
            "Well done! Think about handling edge cases more robustly.",
            "Excellent approach! You might want to add more comments."
        ]
        
        suggestions_templates = [
            "Consider using more descriptive variable names.",
            "Add input validation to handle edge cases.",
            "Think about the space complexity of your solution.",
            "Consider using built-in functions for better performance.",
            "Add error handling for invalid inputs."
        ]
        
        time_complexities = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)"]
        space_complexities = ["O(1)", "O(n)", "O(log n)", "O(n²)"]
        
        # Generate mock feedback
        feedback = random.choice(feedback_templates)
        suggestions = random.sample(suggestions_templates, 2)
        
        # Mock complexity analysis
        time_complexity = random.choice(time_complexities)
        space_complexity = random.choice(space_complexities)
        
        return AIFeedbackResponse(
            feedback=feedback,
            suggestions=suggestions,
            time_complexity=time_complexity,
            space_complexity=space_complexity
        )
    
    async def analyze_code_quality(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code quality (mock implementation)"""
        
        # Mock code quality metrics
        return {
            "readability_score": random.randint(60, 95),
            "complexity_score": random.randint(30, 80),
            "test_coverage": random.randint(50, 90),
            "code_smells": random.randint(0, 3),
            "recommendations": [
                "Consider extracting this logic into a separate function.",
                "This loop could be optimized using a more efficient algorithm.",
                "Add unit tests for this function."
            ]
        }