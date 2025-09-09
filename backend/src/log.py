import logging
import os
from src.setting import get_settings

logger = logging.getLogger("backend")
logger.setLevel(logging.DEBUG)  # 設定 logger 最低等級為 DEBUG，handler 可過濾

formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

setting = get_settings()
log_dir = setting.log_dir
os.makedirs(log_dir, exist_ok=True)
log_file_path = os.path.join(log_dir, "backend.log")

file_handler = logging.FileHandler(log_file_path, encoding="utf-8")
file_handler.setFormatter(formatter)
ch = logging.StreamHandler()
ch.setFormatter(formatter)
logger.addHandler(file_handler)
logger.addHandler(ch)
