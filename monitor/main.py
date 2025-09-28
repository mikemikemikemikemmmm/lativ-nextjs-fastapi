import requests
import smtplib
from email.message import EmailMessage
from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime

EMAIL_FROM="mikespiderman1992@gmail.com"
EMAIL_PASSWORD="mgdi patq pbyi cvfs"
EMAIL_TO="mikem40099@gmail.com"
BACKEND_ADMIN_URL="http://127.0.0.1:8001/health_check"
BACKEND_GUEST_URL="http://127.0.0.1:8002/health_check"
PORT=8000

MAX_EMAILS = 3           # 每個服務最多發送三封錯誤郵件
FAILURE_THRESHOLD = 3    # 連續失敗次數達到閾值才發郵件

# ---------- 錯誤計數 ----------
error_count_admin = 0
error_count_guest = 0

consecutive_fail_admin = 0
consecutive_fail_guest = 0

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
        print(f"無法發送郵件: {e}")

# ---------- 健康檢查函數 ----------
def check_backend(url: str, name: str, error_counter: str):
    global error_count_admin, error_count_guest
    global consecutive_fail_admin, consecutive_fail_guest

    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"{name} Status code: {response.status_code}")
            if error_counter == "admin":
                consecutive_fail_admin += 1
                if consecutive_fail_admin >= FAILURE_THRESHOLD and error_count_admin < MAX_EMAILS:
                    send_email(f"{name} 系統已崩潰", f"Status code: {response.status_code}")
                    error_count_admin += 1
            else:
                consecutive_fail_guest += 1
                if consecutive_fail_guest >= FAILURE_THRESHOLD and error_count_guest < MAX_EMAILS:
                    send_email(f"{name} 系統已崩潰", f"Status code: {response.status_code}")
                    error_count_guest += 1
        else:
            # 成功回應，重置連續失敗計數器
            if error_counter == "admin":
                consecutive_fail_admin = 0
            else:
                consecutive_fail_guest = 0

    except Exception as e:
        print(f"Exception: {e}")
        if error_counter == "admin":
            consecutive_fail_admin += 1
            if consecutive_fail_admin >= FAILURE_THRESHOLD and error_count_admin < MAX_EMAILS:
                send_email(f"{name} 監控系統出錯", f"{e}")
                error_count_admin += 1
        else:
            consecutive_fail_guest += 1
            if consecutive_fail_guest >= FAILURE_THRESHOLD and error_count_guest < MAX_EMAILS:
                send_email(f"{name} 監控系統出錯", f"{e}")
                error_count_guest += 1

# ---------- 排程 ----------
def run_scheduler():
    scheduler = BlockingScheduler()
    scheduler.add_job(lambda: check_backend(BACKEND_ADMIN_URL, "Admin", "admin"),
                      "interval", seconds=5, id="check_admin")
    scheduler.add_job(lambda: check_backend(BACKEND_GUEST_URL, "Guest", "guest"),
                      "interval", seconds=5, id="check_guest")
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