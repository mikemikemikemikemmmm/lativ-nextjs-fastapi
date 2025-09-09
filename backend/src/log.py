import logging
import sys

# 設定 logging

# 將 print 也導向 logging（選擇性）

class LoggerWriter:
    def __init__(self, level):
        self.level = level
    def write(self, message):
        if message.strip():  # 避免空行
            self.level(message.strip())
    def flush(self):
        pass

def setup_logging():
    sys.stdout = LoggerWriter(logging.info)
    sys.stderr = LoggerWriter(logging.error)
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )



# logger = logging.getLogger("backend")
# def handle_exception(exc_type, exc_value, exc_traceback):
#     if issubclass(exc_type, KeyboardInterrupt):
#         sys.__excepthook__(exc_type, exc_value, exc_traceback)
#         return
#     logger.critical("Unhandled exception", exc_info=(exc_type, exc_value, exc_traceback))

# def setup_logger():
#     logger.setLevel(logging.INFO)
#     formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
#     console_handler = logging.StreamHandler(sys.stdout)  # stdout 對應 systemd StandardOutput
#     console_handler.setLevel(logging.INFO)
#     console_handler.setFormatter(formatter)
#     logger.addHandler(console_handler)

#     setting =get_settings()
#     log_dir = setting.log_dir
#     os.makedirs(log_dir, exist_ok=True)
#     file_handler = logging.FileHandler(os.path.join(log_dir, "backend.log"))
#     file_handler.setLevel(logging.INFO)
#     file_handler.setFormatter(formatter)
#     logger.addHandler(file_handler)
#     sys.excepthook = handle_exception