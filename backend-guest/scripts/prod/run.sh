#!/bin/bash
set -e  # 發生錯誤時停止
# 設定環境變數
export ENVIRONMENT=prod
DIR=/home/ubuntu/fastapi/backend-guest
SERVICE_NAME=backend-guest
echo ""
echo "ENVIRONMENT=$ENVIRONMENT"
echo "DIR=$DIR"
echo "SERVICE_NAME=$SERVICE_NAME"
echo ""

cd $DIR 
echo "移動到$DIR"

cargo build --release

echo "build完成"


#=================================

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "$SERVICE_NAME 服務正在運行，準備停止..."
    sudo systemctl stop "$SERVICE_NAME"
else
    echo "$SERVICE_NAME 服務未在運行，直接更新..."
fi

# 複製新的 service 檔案
echo "更新 $SERVICE_NAME 的 service 檔案..."
cd $DIR 
cd "./scripts/prod"
sudo cp "$SERVICE_NAME.service" "/etc/systemd/system/$SERVICE_NAME.service"

# 重新載入 systemd
echo "重新載入 systemd..."
sudo systemctl daemon-reload

# 啟動服務
echo "啟動 $SERVICE_NAME 服務..."
sudo systemctl start "$SERVICE_NAME"

# 檢查服務狀態
echo "檢查 $SERVICE_NAME 服務..."
sudo systemctl status "$SERVICE_NAME"

echo "BACKEND_GUEST部署成功"