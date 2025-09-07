#!/bin/bash
set -e  # 發生錯誤時停止
# 設定環境變數
export ENVIRONMENT=prod
BACKEND_SERVICE_NAME=backend
MONITOR_SERVICE_NAME=monitor
# 生成 .env 文件
echo '${{ secrets.ENV_FILE_CONTENT }}' > ./.env.prod

uv --version || echo "cannot run uv"
uv sync 

#啟動backend service
if [ ! -f /etc/systemd/system/$BACKEND_SERVICE_NAME.service ]; then
    sudo cp $BACKEND_SERVICE_NAME/deploy/$BACKEND_SERVICE_NAME.service /etc/systemd/system/$BACKEND_SERVICE_NAME.service
    sudo systemctl daemon-reload
    sudo systemctl enable $BACKEND_SERVICE_NAME
fi
sudo systemctl restart $BACKEND_SERVICE_NAME

#啟動backend service
if [ ! -f /etc/systemd/system/$MONITOR_SERVICE_NAME.service ]; then
    sudo cp $MONITOR_SERVICE_NAME/deploy/$MONITOR_SERVICE_NAME.service /etc/systemd/system/$MONITOR_SERVICE_NAME.service
    sudo systemctl daemon-reload
    sudo systemctl enable $MONITOR_SERVICE_NAME
fi
sudo systemctl restart $MONITOR_SERVICE_NAME


echo "Deployment completed successfully"