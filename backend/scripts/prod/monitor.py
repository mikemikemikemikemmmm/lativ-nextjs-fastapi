import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
import requests
import smtplib
from email.message import EmailMessage
from apscheduler.schedulers.blocking import BlockingScheduler

# ---------- 環境變數載入 ----------
def load_env():
    environment = os.getenv("ENVIRONMENT")
    if not environment:
        raise EnvironmentError("ENVIRONMENT env not set")

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
import sys
import logging

class LoggerWriter:
    def __init__(self, level_func):
        self.level_func = level_func
        self.buffer = ''

    def write(self, message):
        # logging 不會自動處理換行，先暫存
        self.buffer += message
        while '\n' in self.buffer:
            line, self.buffer = self.buffer.split('\n', 1)
            if line.strip():  # 避免空行
                self.level_func(line.strip())

    def flush(self):
        if self.buffer.strip():
            self.level_func(self.buffer.strip())
        self.buffer = ''

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    # 先建立 logger，再導向 stdout/stderr
    sys.stdout = LoggerWriter(logging.getLogger().info)
    sys.stderr = LoggerWriter(logging.getLogger().error)

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
    setup_logging()
    try:
        send_email("fake-lativ監控系統已重啟", "")
        run()
    except Exception:
        print("Monitor service stopped unexpectedly")
