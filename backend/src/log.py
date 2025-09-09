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