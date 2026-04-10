#!/bin/bash
set -e

# 設定參數
APP_PORT=8000 
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/logs"
LOG_FILE="$LOG_DIR/uvicorn.log"

# 確保環境變數包含 uv
export PATH="$HOME/.local/bin:$PATH"

echo "------------------------------------------"
echo "🚀 Starting Deployment: $(date '+%Y-%m-%d %H:%M:%S')"
echo "📂 Project Root: $PROJECT_ROOT"
echo "------------------------------------------"

cd "$PROJECT_ROOT"

# 1. 優雅停止舊進程 (使用 ss 查找 PID)
echo "🛑 Checking for existing service on port $APP_PORT..."

# ss -tlnp: t(tcp), l(listening), n(numeric), p(process)
# awk 抓取 "pid=xxxx" 的部分並提取數字
OLD_PID=$(ss -tlnp "sport = :$APP_PORT" | grep -oP 'pid=\K[0-9]+' | head -n 1 || true)

if [ -n "$OLD_PID" ]; then
    echo "Found process $OLD_PID. Sending SIGTERM..."
    kill -15 "$OLD_PID"
    
    # 等待並確認 Port 已釋放
    TIMEOUT=10
    while ss -tln | grep -q ":$APP_PORT " && [ $TIMEOUT -gt 0 ]; do
        sleep 1
        ((TIMEOUT--))
    done

    # 如果還在，強制刪除
    if ss -tln | grep -q ":$APP_PORT "; then
        echo "⚠️ Port still bound. Sending SIGKILL..."
        REMAINING_PID=$(ss -tlnp "sport = :$APP_PORT" | grep -oP 'pid=\K[0-9]+' | head -n 1 || true)
        [ -n "$REMAINING_PID" ] && kill -9 "$REMAINING_PID"
    fi
fi

# 2. 啟動新服務
mkdir -p "$LOG_DIR"

# 簡單日誌輪替：保留上一次的日誌
[ -f "$LOG_FILE" ] && mv "$LOG_FILE" "${LOG_FILE}.old"

echo "🔥 Starting FastAPI application..."
# 使用 nohup 啟動
nohup uv run uvicorn main:app \
    --host 0.0.0.0 \
    --port $APP_PORT \
    --proxy-headers \
    --forwarded-allow-ips='*' \
    > "$LOG_FILE" 2>&1 &

NEW_PID=$!

# 3. 健康檢查
sleep 3
# kill -0 僅檢查進程是否存在，不會真的殺死進程
if kill -0 $NEW_PID 2>/dev/null; then
    echo "✅ Deployment successful! PID: $NEW_PID"
    echo "日誌預覽 (最後 5 行):"
    tail -n 5 "$LOG_FILE"
else
    echo "❌ Deployment failed. Check $LOG_FILE"
    exit 1
fi