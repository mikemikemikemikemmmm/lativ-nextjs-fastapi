import requests
import smtplib
from email.message import EmailMessage
from apscheduler.schedulers.blocking import BlockingScheduler
import os
from dotenv import load_dotenv
import time
from pathlib import Path


# ---------- 配置 ----------
def load_env():
    environment = os.getenv("ENVIRONMENT")
    if not environment:
        raise Exception("no environment env")
    current_file = Path(__file__).resolve()
    target_dir = current_file.parent.parent.parent
    dotenv_file_name = f".env.{environment}"
    dotenv_file_path = target_dir / dotenv_file_name
    print(dotenv_file_path)
    if not dotenv_file_path.exists():
        raise Exception(f"env file not exist, dotenv_file_path:{dotenv_file_path}")
    load_dotenv(dotenv_path=dotenv_file_path)
    print(f"current environment : {environment}")


load_env()
EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_TO = os.getenv("EMAIL_TO")
FASTAPI_URL = os.getenv("FASTAPI_URL")  # FastAPI 的健康檢查 endpoint


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
            server.login(EMAIL_FROM, EMAIL_PASSWORD)  # type: ignore
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")


# ---------- 每日檢查 URL ----------
def check_url():
    try:
        response = requests.get(FASTAPI_URL, timeout=10)  # type: ignore
        if response.status_code != 200:
            send_email(
                "fake-lativ系統已崩潰",
                f"Status code: {response.status_code}",
            )
        else:
            send_email(
                "fake-lativ正常運作",
                "",
            )

    except Exception as e:
        send_email("fake-lativ監控系統出錯", str(e))


def run():
    scheduler = BlockingScheduler()
    scheduler.add_job(check_url, "interval", hours=12)
    scheduler.start()


# ---------- 監控主程式 ----------
if __name__ == "__main__":
    print("Monitor service started")
    try:
        send_email("fake-lativ監控系統已重啟", "")
        run()
    except:
        print("Monitor service stopped")
