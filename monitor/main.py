import os
import requests
import smtplib
from email.message import EmailMessage
from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

EMAIL_FROM="mikespiderman1992@gmail.com"
EMAIL_PASSWORD=os.environ["EMAIL_PASSWORD"]
EMAIL_TO=os.environ["EMAIL_TO"]
BACKEND_ADMIN_URL="http://127.0.0.1:8001/admin/health_check"
PORT=8000

MAX_EMAILS = 3           # 每個服務最多發送三封錯誤郵件
FAILURE_THRESHOLD = 3    # 連續失敗次數達到閾值才發郵件

# ---------- 錯誤計數 ----------
error_count_admin = 0
consecutive_fail_admin = 0

# ---------- 發送郵件 ----------
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
        print(f"can't send email: {e}")

# ---------- 健康檢查函數 ----------
def check_backend(url: str, name: str, scheduler: BlockingScheduler, job_id: str):
    global error_count_admin, consecutive_fail_admin

    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"{name} Status code: {response.status_code}")
            consecutive_fail_admin += 1
            if consecutive_fail_admin >= FAILURE_THRESHOLD:
                send_email(f"{name} 系統已崩潰", f"Status code: {response.status_code}")
                scheduler.remove_job(job_id)
                print(f"{name} job cancel")
        else:
            consecutive_fail_admin = 0

    except Exception as e:
        print(f"Exception: {e}")
        consecutive_fail_admin += 1
        if consecutive_fail_admin >= FAILURE_THRESHOLD:
            send_email(f"{name} 監控系統出錯", f"{e}")
            scheduler.remove_job(job_id)
            print(f"{name} job cancel")

# ---------- 排程 ----------
def run_scheduler():
    scheduler = BlockingScheduler()
    scheduler.add_job(lambda: check_backend(BACKEND_ADMIN_URL, "Admin", scheduler, "check_admin"),
                      "interval", seconds=5, id="check_admin")
    print("Scheduler started")
    scheduler.start()

# ---------- 主程式 ----------
def start():
    now = datetime.now()
    print(f"current time: {now}")
    print("Monitor service started")
    try:
        send_email("fake-lativ監控系統已重啟", "")
        run_scheduler()
    except Exception:
        print("Monitor service stopped unexpectedly")

if __name__ == "__main__":
    start()
