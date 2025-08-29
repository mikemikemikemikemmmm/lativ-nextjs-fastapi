@echo off
REM 檢查是否提供了參數
IF "%~1"=="" (
    echo ❌ Usage: makemigration.bat "migration message"
    exit /b 1
)

REM Alembic 自動生成 migration
set ENVIRONMENT=dev&&uv run alembic revision --autogenerate -m "%~1"

pause