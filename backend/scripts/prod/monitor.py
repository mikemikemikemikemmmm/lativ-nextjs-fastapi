import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
import requests
import smtplib
from email.message import EmailMessage
from apscheduler.schedulers.blocking import BlockingScheduler
from logging import FileHandler
from datetime import datetime

# ---------- 日誌設定 ----------
logger = logging.getLogger("monitor")

def setup_log(console_level=logging.INFO, file_level=logging.DEBUG, max_bytes=10*1024*1024, backup_count=5):
    """設定 logger"""
    logger.setLevel(logging.DEBUG)  # 設定 logger 最低等級為 DEBUG，handler 可過濾
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    # 避免重複加入 handler
    if not logger.hasHandlers():
        os.makedirs(LOG_DIR, exist_ok=True)
        log_file_path = os.path.join(LOG_DIR, "monitor.log")
        
        file_handler = FileHandler(
            log_file_path, encoding="utf-8"
        )
        file_handler.setLevel(file_level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)


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


# ---------- URL 健康檢查 ----------# ---------- 錯誤計數 ----------
error_count = 0
MAX_EMAILS = 3  # 最多發三封

def check_url():
    global error_count
    try:
        response = requests.get(MONITOR_CHECK_URL, timeout=10)
        if response.status_code != 200:
            msg = f"Status code: {response.status_code}"
            print(msg)
            if error_count < MAX_EMAILS:
                send_email("fake-lativ系統已崩潰", msg)
                error_count += 1
    except Exception as e:
        print(f"Exception: {e}")
        if error_count < MAX_EMAILS:
            send_email("fake-lativ監控系統出錯", f"{e}")
            error_count += 1


# ---------- 排程 ----------
def run():
    scheduler = BlockingScheduler()
    scheduler.add_job(check_url, "interval", minutes=1, id="check_health")
    print("Scheduler started")
    scheduler.start()


# ---------- 主程式 ----------
if __name__ == "__main__":
    now = datetime.now()
    print(f"current time , {now}")
    environment = os.getenv("ENVIRONMENT")
    if not environment:
        raise EnvironmentError(f"ENVIRONMENT env not set , time :{now}")
    print(f"now env , {environment}")
    current_file = Path(__file__).resolve()
    target_dir = current_file.parent.parent.parent
    dotenv_file_name = f".env.{environment}"
    dotenv_file_path = target_dir / dotenv_file_name
    print("dotenv_file_path", dotenv_file_path)
    if not dotenv_file_path.exists():
        raise FileNotFoundError(f"Env file not exist: {dotenv_file_path} , time :{now}")
    load_dotenv(dotenv_file_path)
 
    EMAIL_FROM = os.getenv("EMAIL_FROM", "")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_TO = os.getenv("EMAIL_TO", "")
    MONITOR_CHECK_URL = os.getenv("MONITOR_CHECK_URL", "")
    LOG_DIR = os.getenv("LOG_DIR", "")
    env_vars = {
        "EMAIL_FROM": EMAIL_FROM,
        "EMAIL_PASSWORD": EMAIL_PASSWORD,
        "EMAIL_TO": EMAIL_TO,
        "MONITOR_CHECK_URL": MONITOR_CHECK_URL,
        "LOG_DIR": LOG_DIR
    }
    empty_vars = [name for name, value in env_vars.items() if not value]
    if empty_vars:
        raise EnvironmentError(f"empty value in env: {', '.join(empty_vars)}")
    print("success load .env file")
    setup_log()
    print("setup log success")
    print("Monitor service started")
    try:
        send_email("fake-lativ監控系統已重啟", "")
        run()
    except Exception:
        print("Monitor service stopped unexpectedly")
