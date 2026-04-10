#!/bin/bash
set -e  # 發生錯誤時停止

# 設定環境變數

export PATH="$HOME/.local/bin:$PATH"
export ENVIRONMENT=prod
DIR=/var/www/lativ-fastapi/backend-admin
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME=backend-admin

echo ""
echo "ENVIRONMENT=$ENVIRONMENT"
echo "DIR=$DIR"
echo "SERVICE_NAME=$SERVICE_NAME"
echo ""

cd $DIR
echo "移動到 $DIR"
uv --version || echo "cannot run uv"
uv sync
echo "uv sync 成功"

#=================================

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "$SERVICE_NAME 服務正在運行，準備停止..."
    sudo systemctl stop "$SERVICE_NAME"
else
    echo "$SERVICE_NAME 服務未在運行，直接更新..."
fi

# 複製新的 service 檔案
echo "更新 $SERVICE_NAME 的 service 檔案..."
sudo cp "$SCRIPT_DIR/$SERVICE_NAME.service" "/etc/systemd/system/$SERVICE_NAME.service"

# 重新載入 systemd
echo "重新載入 systemd..."
sudo systemctl daemon-reload

# 啟動服務
echo "啟動 $SERVICE_NAME 服務..."
sudo systemctl start "$SERVICE_NAME"

# 檢查服務狀態
echo "檢查 $SERVICE_NAME 服務..."
sudo systemctl status "$SERVICE_NAME"

echo "backend-admin 部署成功"
"
else
    echo "❌ Deployment failed. Check $LOG_FILE"
    exit 1
fi"
else
    echo "❌ Deployment failed. Check $LOG_FILE"
    exit 1
fi