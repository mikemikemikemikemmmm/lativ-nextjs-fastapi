import logging
import os
logger = logging.getLogger("backend")
logger.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
console_handler.setFormatter(console_formatter)

# File handler
os.makedirs("../logs", exist_ok=True)
file_handler = logging.FileHandler("../logs/backend.log")
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(console_formatter)

# 加入 logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)
