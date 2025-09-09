import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
import requests
import smtplib
from email.message import EmailMessage
from apscheduler.schedulers.blocking import BlockingScheduler
from logging.handlers import RotatingFileHandler
from datetime import datetime

# ---------- 環境變數載入 ----------
def load_env():
    environment = os.getenv("ENVIRONMENT")
    if not environment:
        now = datetime.now()
        raise EnvironmentError(f"ENVIRONMENT env not set.time :{now}")

    current_file = Path(__file__).resolve()
    target_dir = current_file.parent.parent.parent
    dotenv_file_name = f".env.{environment}"
    dotenv_file_path = target_dir / dotenv_file_name

    if not dotenv_file_path.exists():
        raise FileNotFoundError(f"Env file not exist: {dotenv_file_path}")

    load_dotenv(dotenv_file_path)
    print(f"Current environment: {environment}")


load_env()

# 必須的環境變數
EMAIL_FROM = os.getenv("EMAIL_FROM", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_TO = os.getenv("EMAIL_TO", "")
MONITOR_CHECK_URL = os.getenv("MONITOR_CHECK_URL", "")
LOG_DIR = os.getenv("LOG_DIR", "")
if "" in [EMAIL_FROM, EMAIL_PASSWORD, EMAIL_TO, MONITOR_CHECK_URL,LOG_DIR]:
    raise EnvironmentError("環境變數有空值")

# ---------- 日誌設定 ----------
# logger = logging.getLogger("monitor")

# def setup_log(console_level=logging.INFO, file_level=logging.DEBUG, max_bytes=10*1024*1024, backup_count=5):
#     """設定 logger"""
#     logger.setLevel(logging.DEBUG)  # 設定 logger 最低等級為 DEBUG，handler 可過濾

#     formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

#     # 避免重複加入 handler
#     if not logger.hasHandlers():
#         os.makedirs(LOG_DIR, exist_ok=True)
#         log_file_path = os.path.join(LOG_DIR, "monitor.log")
        
#         file_handler = RotatingFileHandler(
#             log_file_path, maxBytes=max_bytes, backupCount=backup_count, encoding="utf-8"
#         )
#         file_handler.setLevel(file_level)
#         file_handler.setFormatter(formatter)
#         logger.addHandler(file_handler)


# ---------- 郵件發送 ----------
def send_email(subject: str, content: str):
    msg = EmailMessage()
    msg.set_content(content)
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = EMAIL_TO

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(f"無法發送郵件: {e}")


# ---------- URL 健康檢查 ----------
def check_url():
    try:
        response = requests.get(MONITOR_CHECK_URL, timeout=10)
        if response.status_code != 200:
            msg = f"Status code: {response.status_code}"
            print(msg)
            send_email("fake-lativ系統已崩潰", msg)
    except Exception as e:
        send_email("fake-lativ監控系統出錯", f"{e}")


# ---------- 排程 ----------
def run():
    scheduler = BlockingScheduler()
    scheduler.add_job(check_url, "interval", minutes=1, id="check_health")
    print("Scheduler started")
    scheduler.start()


# ---------- 主程式 ----------
if __name__ == "__main__":
    print("Monitor service started")
    setup_log()
    try:
        send_email("fake-lativ監控系統已重啟", "")
        run()
    except Exception:
        print("Monitor service stopped unexpectedly")
