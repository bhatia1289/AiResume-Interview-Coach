@echo off
echo Starting backend server on 0.0.0.0:8000...
cd /d "%~dp0"

if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

:: Run uvicorn directly to ensure host binding
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
