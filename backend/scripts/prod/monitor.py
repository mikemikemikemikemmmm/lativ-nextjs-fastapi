import requests
import smtplib
from email.message import EmailMessage
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import os
# ---------- 配置 ----------
EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_TO = os.getenv("EMAIL_TO")
FASTAPI_URL = os.getenv("FASTAPI_URL")  # FastAPI 的健康檢查 endpoint
CHECK_URL = os.getenv("CHECK_URL")
CHECK_HOUR = 0  # 每天0點檢查

# ---------- 郵件發送 ----------
def send_email(subject: str, content: str):
    msg = EmailMessage()
    msg.set_content(content)
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = EMAIL_TO

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD) # type: ignore
            server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")

# ---------- 每日檢查 URL ----------
def check_url():
    try:
        response = requests.get(CHECK_URL, timeout=10)# type: ignore
        if response.status_code != 200:
            send_email(
                f"URL Check Failed ({CHECK_URL})",
                f"Status code: {response.status_code}"
            )
    except Exception as e:
        send_email(
            f"URL Check Exception ({CHECK_URL})",
            str(e)
        )

def run ():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_url, 'cron', hour=CHECK_HOUR)
    scheduler.start()

# ---------- 監控主程式 ----------
if __name__ == "__main__":
    print("Monitor service started")
    try:
        # 保持程式持續運行
        import time
        run()
        send_email("測試信件", "這是一封測試郵件，確認 Gmail SMTP 可用")    
    except KeyboardInterrupt:
        print("Monitor service stopped")