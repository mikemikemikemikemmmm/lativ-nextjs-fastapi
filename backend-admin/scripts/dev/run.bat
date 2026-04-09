@echo off
:: 切換到該批次檔所在的目錄 (/d 參數確保跨磁碟也能切換)
cd /d "%~dp0"

:: 切換到 backend-admin 根目錄
cd /d "%~dp0\..\.."

:: 設定環境變數
set ENVIRONMENT=dev
set PYTHONPATH=%CD%

:: 執行 backend-admin 根目錄下的 main.py
uv run src\main.py