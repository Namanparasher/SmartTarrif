@echo off
set "PYTHONIOENCODING=utf-8"
if exist "%LocalAppData%\Programs\Python\Python312\python.exe" (
    "%LocalAppData%\Programs\Python\Python312\python.exe" -m uvicorn main:app --port 8000 --reload
) else (
    python -m uvicorn main:app --port 8000 --reload
)
pause
