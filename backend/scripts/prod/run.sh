#!/bin/bash
set -e  # 發生錯誤時停止
# 設定環境變數
export ENVIRONMENT=prod
BACKEND_DIR=/home/ubuntu/fastapi/backend
BACKEND_SERVICE_NAME=backend
MONITOR_SERVICE_NAME=monitor
echo ""
echo "ENVIRONMENT=$ENVIRONMENT"
echo "BACKEND_DIR=$BACKEND_DIR"
echo "BACKEND_SERVICE_NAME=$BACKEND_SERVICE_NAME"
echo "MONITOR_SERVICE_NAME=$MONITOR_SERVICE_NAME"
echo ""

cd $BACKEND_DIR 
echo "移動到$BACKEND_DIR"
uv --version || echo "cannot run uv"
uv sync 
echo "uv sync成功"


#=================================

if systemctl is-active --quiet "$BACKEND_SERVICE_NAME"; then
    echo "$BACKEND_SERVICE_NAME 服務正在運行，準備停止..."
    sudo systemctl stop "$BACKEND_SERVICE_NAME"
else
    echo "$BACKEND_SERVICE_NAME 服務未在運行，直接更新..."
fi

# 複製新的 service 檔案
echo "更新 $BACKEND_SERVICE_NAME 的 service 檔案..."
sudo cp "$BACKEND_DIR/scripts/prod/$BACKEND_SERVICE_NAME.service" "/etc/systemd/system/$BACKEND_SERVICE_NAME.service"

# 重新載入 systemd
echo "重新載入 systemd..."
sudo systemctl daemon-reload

# 啟動服務
echo "啟動 $BACKEND_SERVICE_NAME 服務..."
sudo systemctl start "$BACKEND_SERVICE_NAME"

# 檢查服務狀態
echo "檢查 $BACKEND_SERVICE_NAME 服務..."
sudo systemctl status "$BACKEND_SERVICE_NAME"


#=================================

if systemctl is-active --quiet "$MONITOR_SERVICE_NAME"; then
    echo "$MONITOR_SERVICE_NAME 服務正在運行，準備停止..."
    sudo systemctl stop "$MONITOR_SERVICE_NAME"
else
    echo "$MONITOR_SERVICE_NAME 服務未在運行，直接更新..."
fi

# 複製新的 service 檔案
echo "更新 $MONITOR_SERVICE_NAME 的 service 檔案..."
sudo cp "$BACKEND_DIR/scripts/prod/$MONITOR_SERVICE_NAME.service" "/etc/systemd/system/$MONITOR_SERVICE_NAME.service"

# 重新載入 systemd
echo "重新載入 systemd..."
sudo systemctl daemon-reload

# 啟動服務
echo "啟動 $MONITOR_SERVICE_NAME 服務..."
sudo systemctl start "$MONITOR_SERVICE_NAME"

# 檢查服務狀態
echo "檢查 $MONITOR_SERVICE_NAME 服務..."
sudo systemctl status "$MONITOR_SERVICE_NAME"


#=================================

echo "部署成功"