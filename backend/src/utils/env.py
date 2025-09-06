import os
from dotenv import load_dotenv
from pathlib import Path
def load_env():
    environment = os.getenv("ENVIRONMENT")
    if not environment:
        raise Exception("no environment env")
    current_file = Path(__file__).resolve()
    parent_two = current_file.parent.parent
    dotenv_file_name = f".env.{environment}"
    dotenv_file_path = parent_two/dotenv_file_name
    load_dotenv(dotenv_path=dotenv_file_path)
    print(f"current environment : {environment}")

def is_dev_environment():
    from src.setting import get_settings
    setting = get_settings()
    return setting.environment == "dev"