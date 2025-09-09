import logging
import sys
import os
from src.setting import get_settings
# ===========================
# 建立 Logger
# ===========================
logger = logging.getLogger("backend")
logger.setLevel(logging.INFO)

# ===========================
# 日誌格式
# ===========================
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

# ===========================
# StreamHandler → systemd 捕捉 stdout/stderr
# ===========================
console_handler = logging.StreamHandler(sys.stdout)  # stdout 對應 systemd StandardOutput
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# ===========================
# FileHandler → 獨立日誌檔（可控格式）
# ===========================
setting =get_settings()
log_dir = setting.log_dir
os.makedirs(log_dir, exist_ok=True)
file_handler = logging.FileHandler(os.path.join(log_dir, "backend.log"))
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)