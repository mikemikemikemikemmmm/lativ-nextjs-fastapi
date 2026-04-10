#!/bin/bash
# backend-admin/scripts/prod/run.sh

set -eo pipefail

# 1. 設定變數 (因為腳本是在專案目錄內執行，我們用相對路徑轉絕對路徑)
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly APP_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)" # 指向 backend-admin 目錄
readonly SERVICE_NAME="backend-admin"
readonly SERVICE_FILE_SRC="$SCRIPT_DIR/$SERVICE_NAME.service"
readonly UV_PATH="$HOME/.local/bin/uv"

echo "------------------------------------------"
echo "🚀 執行專案內部部署腳本..."
echo "📂 當前 APP 目錄: $APP_DIR"
echo "------------------------------------------"

cd "$APP_DIR" || exit 1

# 2. 執行 uv 同步
echo "📦 正在更新依賴 (uv sync)..."
if ! $UV_PATH sync --no-dev; then
    echo "❌ uv sync 失敗"
    exit 1
fi

# 3. 更新 Systemd 設定
if [ -f "$SERVICE_FILE_SRC" ]; then
    echo "⚙️  更新 Systemd service 檔案..."
    sudo cp "$SERVICE_FILE_SRC" "/etc/systemd/system/$SERVICE_NAME.service"
    sudo systemctl daemon-reload
else
    echo "⚠️  警告: 找不到 service 檔案 $SERVICE_FILE_SRC"
fi

# 4. 重啟服務
echo "🔄 正在重啟服務 $SERVICE_NAME..."
sudo systemctl restart "$SERVICE_NAME"

# 5. 驗證結果
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✅ $SERVICE_NAME 部署成功！"
else
    echo "❌ $SERVICE_NAME 啟動失敗！"
    exit 1
fi