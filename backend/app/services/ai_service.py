"""
AI service using OpenAI-compatible API (OpenAI or LM Studio) 
Returns structured learning data for DSA problems.
"""

import logging
import json
import random
from typing import List, Dict, Any, Optional
import openai
from app.config import settings
from app.models.schemas import AIFeedbackResponse, AIStructuredResponse

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, database):
        self.db = database
        self.client = None
        
        # Initialize client if API key or local base URL is provided
        if settings.OPENAI_API_KEY or "localhost" in settings.OPENAI_BASE_URL:
            try:
                self.client = openai.AsyncOpenAI(
                    api_key=settings.OPENAI_API_KEY or "local-llm",
                    base_url=settings.OPENAI_BASE_URL
                )
            except Exception as e:
                logger.error(f"Failed to initialize AI client: {e}")

    async def generate_hint(
        self,
        question_id: str,
        context: str = "",
        user_id: Optional[str] = None
    ) -> AIStructuredResponse:
        """
        Generate a structured AI hint including concept explanation and improvement areas.
        question_id: the LeetCode problem slug (e.g. 'two-sum')
        context: the user's current code or description of where they are stuck
        """
        # Convert slug to a readable problem name for the prompt
        readable_name = question_id.replace("-", " ").title()
        user_code = context or "I'm stuck and haven't written any code yet."

        prompt = f"""\
You are a DSA expert helping a student who is stuck on a LeetCode problem.
Problem: {readable_name} (slug: {question_id})
User's current code / context: {user_code}

Provide a response in EXACTLY this JSON format:
{{
    "hint": "A small nudge helping them move forward without giving the answer.",
    "concept_explained": "A brief explanation of the core concept or data structure they should use.",
    "improvement_area": "Where their current approach can be improved (logic, complexity, edge cases)."
}}"""

        if self.client:
            try:
                response = await self.client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a specialized DSA tutor. Always respond in JSON format."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"} if "gpt-4" in settings.OPENAI_MODEL or "json" in settings.OPENAI_MODEL.lower() else None
                )
                raw_content = response.choices[0].message.content.strip()
                parsed_json = json.loads(self._clean_json(raw_content))

                return AIStructuredResponse(
                    hint=parsed_json.get("hint", ""),
                    concept_explained=parsed_json.get("concept_explained", ""),
                    improvement_area=parsed_json.get("improvement_area", "")
                )
            except Exception as e:
                logger.error(f"AI Hint Error: {e}")

        # Fallback mock if AI is not configured or call failed
        return self._get_mock_structured_response("hint", readable_name)

    async def generate_feedback(
        self,
        question_id: str,
        code: str = "",
        language: str = "python",
        user_id: Optional[str] = None
    ) -> AIStructuredResponse:
        """
        Generate detailed feedback on code submission in a structured format.
        question_id: the LeetCode problem slug
        code: the user's submitted code
        language: programming language of the submission
        """
        readable_name = question_id.replace("-", " ").title()
        user_code = code or "No code submitted yet."

        prompt = f"""\
Analyze this DSA solution.
Problem: {readable_name} (slug: {question_id})
Language: {language}
User's Submission:
{user_code}

Provide feedback in EXACTLY this JSON format:
{{
    "hint": "Final summary feedback for the user.",
    "concept_explained": "The logic or pattern they correctly or incorrectly used.",
    "improvement_area": "Specific technical improvements needed."
}}"""

        if self.client:
            try:
                response = await self.client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a professional code reviewer. Respond ONLY with JSON."},
                        {"role": "user", "content": prompt}
                    ]
                )
                raw_content = response.choices[0].message.content.strip()
                parsed_json = json.loads(self._clean_json(raw_content))

                return AIStructuredResponse(
                    hint=parsed_json.get("hint", ""),
                    concept_explained=parsed_json.get("concept_explained", ""),
                    improvement_area=parsed_json.get("improvement_area", "")
                )
            except Exception as e:
                logger.error(f"AI Feedback Error: {e}")

        return self._get_mock_structured_response("feedback", readable_name)

    def _clean_json(self, content: str) -> str:
        """Removes markdown code blocks from the string if present"""
        if content.startswith("```"):
            return content.split("```")[1].replace("json", "").strip()
        return content

    def _get_mock_structured_response(self, mode: str, question: str) -> AIStructuredResponse:
        """Fallback mock for stability"""
        if mode == "hint":
            return AIStructuredResponse(
                hint="Try using two pointers to reduce complexity from O(n^2) to O(n).",
                concept_explained="Two-pointer technique is efficient for sorted array problems.",
                improvement_area="Current nested loop is causing time limit issues."
            )
        else:
            return AIStructuredResponse(
                hint="Good approach! You've correctly identified the base case.",
                concept_explained="Recursion with memoization helps avoid redundant calculations.",
                improvement_area="Consider handling null/empty inputs as an edge case."
            )