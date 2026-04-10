#!/bin/bash
set -e  # 發生錯誤時停止

export PATH="$HOME/.local/bin:$PATH"
export ENVIRONMENT=prod
# 腳本執行時 CWD 已是 /var/www/lativ-fastapi (由 deploy.yml 設定)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME=backend-admin

echo ""
echo "ENVIRONMENT=$ENVIRONMENT"
echo "SCRIPT_DIR=$SCRIPT_DIR"
echo "SERVICE_NAME=$SERVICE_NAME"
echo ""

#=================================

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "$SERVICE_NAME 服務正在運行，準備停止..."
    sudo systemctl stop "$SERVICE_NAME"
else
    echo "$SERVICE_NAME 服務未在運行，直接更新..."
fi

# 複製新的 service 檔案（將 User/Group 替換為當前執行者）
CURRENT_USER=$(whoami)
echo "更新 $SERVICE_NAME 的 service 檔案 (User=$CURRENT_USER)..."
sed "s/User=ubuntu/User=$CURRENT_USER/; s/Group=ubuntu/Group=$CURRENT_USER/" \
    "$SCRIPT_DIR/$SERVICE_NAME.service" > /tmp/$SERVICE_NAME.service
sudo cp /tmp/$SERVICE_NAME.service "/etc/systemd/system/$SERVICE_NAME.service"

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
