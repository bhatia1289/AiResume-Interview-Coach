import urllib.request
import json
import urllib.error

url = 'http://localhost:8000/api/ai/hint'
data = {'question_id': 'two-sum', 'context': 'testing'}
data_bytes = json.dumps(data).encode('utf-8')
req = urllib.request.Request(url, data=data_bytes, headers={'Content-Type': 'application/json', 'Accept': 'application/json'})

try:
    with urllib.request.urlopen(req) as f:
        print("Success:", f.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
