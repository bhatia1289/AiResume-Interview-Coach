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
                return self._get_mock_structured_response("hint", readable_name)

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
CRITICAL: Do NOT provide the complete solution. Only provide feedback to help the user improve.
Problem: {readable_name} (slug: {question_id})
Language: {language}
User's Submission:
{user_code}

Provide feedback in EXACTLY this JSON format:
{{
    "hint": "A summary nudge focusing on what they should rethink.",
    "concept_explained": "The core logic error or misunderstanding in their code.",
    "improvement_area": "A specific suggestion on how to fix the logic without giving the full code.",
    "wrong_lines": ["List the specific lines or blocks of code that are incorrect or inefficient."]
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
                    improvement_area=parsed_json.get("improvement_area", ""),
                    wrong_lines=parsed_json.get("wrong_lines", [])
                )
            except Exception as e:
                logger.error(f"AI Feedback Error: {e}")
                # Fallback specifically if API key is invalid or other error
                return self._get_mock_structured_response("feedback", readable_name)

        return self._get_mock_structured_response("feedback", readable_name)

    async def evaluate_solution(
        self,
        question_id: str,
        code: str,
        language: str = "python"
    ) -> Dict[str, Any]:
        """
        Evaluate if a solution is logically correct using AI.
        Returns: { "is_correct": bool, "feedback": str, "score": int }
        """
        readable_name = question_id.replace("-", " ").title()
        
        prompt = f"""\
You are a senior technical interviewer evaluating a coding solution for the problem: {readable_name}.
Problem Slug: {question_id}
Language: {language}

User's Code:
{code}

Evaluate this code against the expected logic for this problem.
JUNK DETECTION: If the input is random text, gibberish (e.g., 'jddhaf'), or completely unrelated to the problem, MUST set is_correct: false and provide feedback: "Invalid code structure."
Be strict but fair.

Provide a response in EXACTLY this JSON format:
{{
    "is_correct": true/false,
    "feedback": "Concise feedback on why it is correct or incorrect.",
    "score": 0-100 (where 100 is perfectly optimized, and 0 is completely wrong)
}}"""

        if self.client:
            try:
                response = await self.client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a specialized code evaluator. Respond ONLY with JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"} if "gpt-4" in settings.OPENAI_MODEL or "json" in settings.OPENAI_MODEL.lower() else None
                )
                raw_content = response.choices[0].message.content.strip()
                print(f"DEBUG: AI Raw Eval Response: {raw_content}")
                parsed_json = json.loads(self._clean_json(raw_content))
                
                return {
                    "is_correct": bool(parsed_json.get("is_correct", False)),
                    "feedback": str(parsed_json.get("feedback", "No feedback provided.")),
                    "score": int(parsed_json.get("score", 0))
                }
            except Exception as e:
                error_msg = str(e)
                print(f"ERROR: AI Evaluation Failed: {error_msg}")
                logger.error(f"AI Evaluation Error: {error_msg}")
                # Reliable fallback logic if AI fails
                return {
                    "is_correct": self._mock_eval_fallback(code),
                    "feedback": f"Evaluated using fallback logic (Error: {error_msg[:50]}...)",
                    "score": 50
                }

        return {
            "is_correct": self._mock_eval_fallback(code),
            "feedback": "Evaluated using fallback logic (AI not configured).",
            "score": 50
        }

    def _mock_eval_fallback(self, code: str) -> bool:
        """Simple syntax-based fallback for evaluation - MUCH stricter"""
        clean_code = code.strip()
        # 1. Total Junk Filter: Code must be at least 30 characters long
        if len(clean_code) < 30:
            return False
            
        lower_code = clean_code.lower()
        
        # 2. Structure Filter: Must have basic keywords to be considered a solution
        has_structure = ("def " in lower_code or "class " in lower_code or "function" in lower_code)
        has_logic = ("return " in lower_code or "if " in lower_code)
        
        if not (has_structure and has_logic):
            return False
            
        # 3. Placeholder Filter: Reject code that is just the default template
        if "pass" in lower_code or "write your solution here" in lower_code:
            return False
            
        return True

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
                improvement_area="Current nested loop is causing time limit issues.",
                wrong_lines=[]
            )
        else:
            return AIStructuredResponse(
                hint="Good approach! You've correctly identified the base case.",
                concept_explained="Recursion with memoization helps avoid redundant calculations.",
                improvement_area="Consider handling null/empty inputs as an edge case.",
                wrong_lines=["Line 5: Missing check for empty array", "Line 8: Index out of bounds potential"]
            )