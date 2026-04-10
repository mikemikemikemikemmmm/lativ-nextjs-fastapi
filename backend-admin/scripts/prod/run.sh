#!/bin/bash
# =================================================================
# 部署腳本：Backend Admin (FastAPI)
# =================================================================

set -eo pipefail  # 更強大的錯誤捕捉，包含 pipeline 錯誤

# 1. 設定變數 (建議使用絕對路徑並用雙引號包裹)
readonly ENVIRONMENT="prod"
readonly APP_DIR="/var/www/lativ-fastapi/backend-admin"
readonly SERVICE_NAME="backend-admin"
readonly SERVICE_FILE_SRC="$APP_DIR/scripts/prod/$SERVICE_NAME.service"

# 印出部署資訊 (使用格式化輸出)
echo "------------------------------------------"
echo "🚀 開始部署: $SERVICE_NAME"
echo "🌍 環境: $ENVIRONMENT"
echo "📂 目錄: $APP_DIR"
echo "------------------------------------------"

# 2. 移動到工作目錄
cd "$APP_DIR" || { echo "❌ 無法進入目錄 $APP_DIR"; exit 1; }

# 3. 執行 uv 同步
echo "📦 正在更新依賴 (uv sync)..."
if ! uv sync; then
    echo "❌ uv sync 失敗，請檢查 python 環境或 pyproject.toml"
    exit 1
fi

# 4. 更新 Systemd 設定 (先更新檔案，減少停機時間)
if [ -f "$SERVICE_FILE_SRC" ]; then
    echo "⚙️  更新 Systemd service 檔案..."
    sudo cp "$SERVICE_FILE_SRC" "/etc/systemd/system/$SERVICE_NAME.service"
    sudo systemctl daemon-reload
else
    echo "⚠️  警告: 找不到 service 檔案 $SERVICE_FILE_SRC，跳過更新..."
fi

# 5. 重啟服務 (使用 restart 通常比 stop + start 更快且穩定)
echo "🔄 正在重啟服務 $SERVICE_NAME..."
sudo systemctl restart "$SERVICE_NAME"

# 6. 驗證結果
echo "🔍 檢查服務狀態..."
# 這裡用 --no-pager 避免在自動化環境卡住，並只顯示前幾行重點
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✅ $SERVICE_NAME 部署成功且運行中！"
    systemctl status "$SERVICE_NAME" --no-pager | grep "Active:"
else
    echo "❌ $SERVICE_NAME 啟動失敗！請檢查日誌: journalctl -u $SERVICE_NAME"
    exit 1
fi

echo "------------------------------------------"