#!/bin/bash
set -e  # 發生錯誤時停止
# 設定環境變數
export ENVIRONMENT=prod
BACKEND_SERVICE_NAME=backend
MONITOR_SERVICE_NAME=monitor
cd $BACKEND_DIR 
echo "移動到$BACKEND_DIR"

uv --version || echo "cannot run uv"
uv sync 
echo "uv sync成功"
#啟動backend service
if [ ! -f /etc/systemd/system/$BACKEND_SERVICE_NAME.service ]; then
    sudo cp ./deploy/$BACKEND_SERVICE_NAME.service /etc/systemd/system/$BACKEND_SERVICE_NAME.service
    sudo systemctl daemon-reload
    sudo systemctl enable $BACKEND_SERVICE_NAME
fi
sudo systemctl restart $BACKEND_SERVICE_NAME
if systemctl is-active --quiet "$BACKEND_SERVICE_NAME"; then
    echo "$BACKEND_SERVICE_NAME 服務啟動成功 ✅"
else
    echo "$BACKEND_SERVICE_NAME 服務啟動失敗 ❌"
    # 可以選擇退出部署
    exit 1
fi

echo "啟動backend service成功"
#啟動MONITOR_SERVICE_NAME
if [ ! -f /etc/systemd/system/$MONITOR_SERVICE_NAME.service ]; then
    sudo cp ./deploy/$MONITOR_SERVICE_NAME.service /etc/systemd/system/$MONITOR_SERVICE_NAME.service
    sudo systemctl daemon-reload
    sudo systemctl enable $MONITOR_SERVICE_NAME
fi
sudo systemctl restart $MONITOR_SERVICE_NAME
if systemctl is-active --quiet "$MONITOR_SERVICE_NAME"; then
    echo "$MONITOR_SERVICE_NAME 服務啟動成功 ✅"
else
    echo "$MONITOR_SERVICE_NAME 服務啟動失敗 ❌"
    # 可以選擇退出部署
    exit 1
fi

echo "啟動monitor service成功"

echo "部署成功"