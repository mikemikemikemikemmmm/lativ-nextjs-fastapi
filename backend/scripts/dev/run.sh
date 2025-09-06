#!/bin/bash

# 設定環境變數
export ENVIRONMENT=dev

# 啟動 uvicorn
uv run uvicorn src.main:app --reload