"""
Script to populate the database with sample data
"""

import asyncio
from datetime import datetime
from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.services.topic_service import TopicService
from app.services.question_service import QuestionService


async def create_sample_data():
    """Create sample topics and questions"""
    await connect_to_mongo()
    
    try:
        db = get_database()
        topic_service = TopicService(db)
        question_service = QuestionService(db)
        
        # Sample topics
        topics_data = [
            {
                "name": "Arrays",
                "description": "Learn about array manipulation, searching, and sorting algorithms",
                "icon": "📊",
                "difficulty": "Easy",
                "slug": "arrays"
            },
            {
                "name": "Strings",
                "description": "String manipulation and pattern matching",
                "icon": "📝",
                "difficulty": "Easy",
                "slug": "strings"
            },
            {
                "name": "Recursion & Backtracking",
                "description": "Solving problems by breaking them down into smaller subproblems",
                "icon": "↩️",
                "difficulty": "Medium",
                "slug": "recursion-backtracking"
            },
            {
                "name": "Linked List",
                "description": "Master linked list operations and common interview questions",
                "icon": "🔗",
                "difficulty": "Medium",
                "slug": "linked-list"
            },
            {
                "name": "Stack",
                "description": "LIFO data structure applications and implementation",
                "icon": "📚",
                "difficulty": "Medium",
                "slug": "stack"
            },
            {
                "name": "Queue",
                "description": "FIFO data structure applications and implementation",
                "icon": "🚶",
                "difficulty": "Medium",
                "slug": "queue"
            },
            {
                "name": "Trees",
                "description": "Explore binary trees, BST, and tree traversal algorithms",
                "icon": "🌳",
                "difficulty": "Medium",
                "slug": "trees"
            },
            {
                "name": "Binary Search",
                "description": "Efficient searching in sorted collections",
                "icon": "🔍",
                "difficulty": "Medium",
                "slug": "binary-search"
            },
            {
                "name": "Heap",
                "description": "Priority queue implementation and applications",
                "icon": "🏔️",
                "difficulty": "Hard",
                "slug": "heap"
            },
            {
                "name": "Hashing",
                "description": "Hash maps, sets, and collision resolution techniques",
                "icon": "#️⃣",
                "difficulty": "Medium",
                "slug": "hashing"
            },
            {
                "name": "Graphs",
                "description": "Understand graph algorithms like BFS, DFS, and shortest paths",
                "icon": "🕸️",
                "difficulty": "Hard",
                "slug": "graphs"
            },
            {
                "name": "Dynamic Programming",
                "description": "Master DP techniques for optimization problems",
                "icon": "⚡",
                "difficulty": "Hard",
                "slug": "dynamic-programming"
            }
        ]
        
        # Create topics
        created_topics = []
        for topic_data in topics_data:
            existing = await topic_service.get_topic_by_slug(topic_data["slug"])
            if not existing:
                topic = await topic_service.create_topic(topic_data)
                created_topics.append(topic)
                print(f"Created topic: {topic.name}")
            else:
                created_topics.append(existing)
                print(f"Topic already exists: {existing.name}")
        
        # Helper to find topic ID by name
        def get_topic_id(name):
            for t in created_topics:
                if t.name == name:
                    return t.id
            return None

        # Sample questions for each topic
        questions_data = []
        
        # Arrays questions
        arrays_id = get_topic_id("Arrays")
        if arrays_id:
            questions_data.extend([
                {
                    "topic_id": arrays_id,
                    "title": "Two Sum",
                    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                    "difficulty": "Easy",
                    "examples": [
                        {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"},
                        {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}
                    ],
                    "constraints": "2 <= nums.length <= 10^4",
                    "code_template": "def twoSum(nums, target):\n    # Your code here\n    pass"
                },
                {
                    "topic_id": arrays_id,
                    "title": "Best Time to Buy and Sell Stock",
                    "description": "You are given an array prices where prices[i] is the price of a given stock on the ith day. Maximize your profit.",
                    "difficulty": "Easy",
                    "examples": [
                        {"input": "prices = [7,1,5,3,6,4]", "output": "5"},
                        {"input": "prices = [7,6,4,3,1]", "output": "0"}
                    ],
                    "constraints": "1 <= prices.length <= 10^5",
                    "code_template": "def maxProfit(prices):\n    # Your code here\n    pass"
                }
            ])

        # Linked Lists questions
        ll_id = get_topic_id("Linked List")
        if ll_id:
            questions_data.append(
                {
                    "topic_id": ll_id,
                    "title": "Reverse Linked List",
                    "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
                    "difficulty": "Easy",
                    "examples": [
                        {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"},
                        {"input": "head = [1,2]", "output": "[2,1]"}
                    ],
                    "constraints": "The number of nodes in the list is in the range [0, 5000]",
                    "code_template": "def reverseList(head):\n    # Your code here\n    pass"
                }
            )

        # Trees questions
        trees_id = get_topic_id("Trees")
        if trees_id:
            questions_data.append(
                {
                    "topic_id": trees_id,
                    "title": "Maximum Depth of Binary Tree",
                    "description": "Given the root of a binary tree, return its maximum depth.",
                    "difficulty": "Easy",
                    "examples": [
                        {"input": "root = [3,9,20,null,null,15,7]", "output": "3"},
                        {"input": "root = [1,null,2]", "output": "2"}
                    ],
                    "constraints": "The number of nodes in the tree is in the range [0, 10^4]",
                    "code_template": "def maxDepth(root):\n    # Your code here\n    pass"
                }
            )

        # Graphs questions
        graphs_id = get_topic_id("Graphs")
        if graphs_id:
            questions_data.append(
                {
                    "topic_id": graphs_id,
                    "title": "Number of Islands",
                    "description": "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
                    "difficulty": "Medium",
                    "examples": [
                        {"input": "grid = [[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]", "output": "1"},
                        {"input": "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]", "output": "3"}
                    ],
                    "constraints": "m == grid.length, n == grid[i].length, 1 <= m, n <= 300",
                    "code_template": "def numIslands(grid):\n    # Your code here\n    pass"
                }
            )
            
        # Dynamic Programming questions
        dp_id = get_topic_id("Dynamic Programming")
        if dp_id:
            questions_data.append(
                {
                    "topic_id": dp_id,
                    "title": "Climbing Stairs",
                    "description": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps.",
                    "difficulty": "Easy",
                    "examples": [
                        {"input": "n = 2", "output": "2"},
                        {"input": "n = 3", "output": "3"}
                    ],
                    "constraints": "1 <= n <= 45",
                    "code_template": "def climbStairs(n):\n    # Your code here\n    pass"
                }
            )
        
        # Create questions
        for question_data in questions_data:
            existing = await db.questions.find_one({
                "title": question_data["title"],
                "topic_id": question_data["topic_id"]
            })
            
            if not existing:
                question = await question_service.create_question(question_data)
                print(f"Created question: {question.title}")
                
                # Update topic problems count
                count = await question_service.count_questions_by_topic(question.topic_id)
                await topic_service.update_problems_count(question.topic_id, count)
            else:
                print(f"Question already exists: {question_data['title']}")
        
        print("Sample data creation completed!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        raise
    
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(create_sample_data())