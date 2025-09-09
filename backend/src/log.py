import sys
import logging
import os
from src.setting import get_settings
from logging.handlers import RotatingFileHandler

logger = logging.getLogger("backend")

def handle_exception(exc_type, exc_value, exc_traceback):
    """全域未捕捉例外處理"""
    if issubclass(exc_type, KeyboardInterrupt):
        # 保持 Ctrl+C 正常退出
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    logger.critical("Unhandled exception", exc_info=(exc_type, exc_value, exc_traceback))

def setup_log(console_level=logging.INFO, file_level=logging.DEBUG, max_bytes=10*1024*1024, backup_count=5):
    """設定 logger"""
    logger.setLevel(logging.DEBUG)  # 設定 logger 最低等級為 DEBUG，handler 可過濾

    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

    # 避免重複加入 handler
    if not logger.hasHandlers():
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(console_level)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # File handler with rotation
        setting = get_settings()  # 你的設定函式
        log_dir = setting.log_dir
        os.makedirs(log_dir, exist_ok=True)
        log_file_path = os.path.join(log_dir, "backend.log")
        
        file_handler = RotatingFileHandler(
            log_file_path, maxBytes=max_bytes, backupCount=backup_count, encoding="utf-8"
        )
        file_handler.setLevel(file_level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    # 設定全域未捕捉例外處理
    sys.excepthook = handle_exception
