#!/bin/bash
# 遇到錯誤立即停止
set -e

APP_PORT=8000 
# 獲取腳本所在目錄的上一層即為專案根目錄 (backend-admin)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "------------------------------------------"
echo "🚀 Starting Deployment: $(date)"
echo "📂 Project Root: $PROJECT_ROOT"
echo "------------------------------------------"

cd "$PROJECT_ROOT"

# 1. 處理舊進程 (優雅停止)
echo "🛑 Checking for existing service on port $APP_PORT..."
OLD_PID=$(lsof -t -i:$APP_PORT || true)

if [ -n "$OLD_PID" ]; then
    echo "Found old process $OLD_PID. Killing..."
    kill -15 "$OLD_PID"
    # 等待最多 5 秒確保 Port 已釋放
    for i in {1..5}; do
        if ! lsof -i:$APP_PORT > /dev/null; then break; fi
        sleep 1
    done
fi

# 2. 啟動新服務
echo "🔥 Starting FastAPI application..."
# 使用 nohup 並將日誌輸出到 logs 目錄
mkdir -p "$PROJECT_ROOT/logs"
nohup uv run uvicorn main:app \
    --host 0.0.0.0 \
    --port $APP_PORT \
    --proxy-headers \
    --forwarded-allow-ips='*' \
    > "$PROJECT_ROOT/logs/uvicorn.log" 2>&1 &

# 3. 簡易健康檢查
sleep 2
if ps -p $! > /dev/null; then
    echo "✅ Deployment successful! PID: $!"
    echo "日誌位置: $PROJECT_ROOT/logs/uvicorn.log"
else
    echo "❌ Deployment failed. Check logs/uvicorn.log"
    exit 1
fi