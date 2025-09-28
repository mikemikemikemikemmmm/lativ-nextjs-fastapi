import logging
import os
from src.setting import get_settings
from src.utils import env
import threading

class AppLogger:
    _instance = None
    _lock = threading.Lock()  # 多執行緒安全鎖

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # 避免 __init__ 被多次呼叫
        if hasattr(self, "_initialized") and self._initialized:
            return

        self.logger = logging.getLogger("backend")
        if self.logger.handlers:
            return  # 避免重複添加 handler

        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

        # 終端機輸出
        ch = logging.StreamHandler()
        ch.setFormatter(formatter)
        self.logger.addHandler(ch)

        if not env.is_dev_environment():
            setting = get_settings()
            log_dir = setting.log_dir
            os.makedirs(log_dir, exist_ok=True)
            log_file_path = os.path.join(log_dir, "backend-app.log")
            file_handler = logging.FileHandler(log_file_path, encoding="utf-8")
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

            self.logger.setLevel(logging.DEBUG)  # 生產環境設定 DEBUG 級別

        self._initialized = True  # 標記初始化完成

    def logErr(self, detail: str):
        self.logger.error(f"err log detail={detail}", exc_info=True)

def get_logger():
    return AppLogger()