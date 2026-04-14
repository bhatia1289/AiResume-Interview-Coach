import urllib.request
import json
import urllib.error
import jwt
from datetime import datetime, timedelta

url = 'http://localhost:8000/api/progress/submission'
data = {'question_id': 'two-sum', 'code': 'def twoSum(nums, target):\n    return [0, 1]', 'language': 'python3'}
data_bytes = json.dumps(data).encode('utf-8')

# Using the SECRET_KEY from .env
SECRET_KEY = "your-super-secret-key-change-this-in-production"
MOCK_TOKEN = jwt.encode({"sub": "test_user_id", "exp": datetime.utcnow() + timedelta(minutes=60)}, SECRET_KEY, algorithm="HS256")

req = urllib.request.Request(url, data=data_bytes, headers={'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': f'Bearer {MOCK_TOKEN}'})

try:
    with urllib.request.urlopen(req) as f:
        print("Success:", f.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
