import os
from dotenv import load_dotenv
from pathlib import Path

def load_env():
    environment = os.getenv("ENVIRONMENT")
    if not environment:
        raise Exception("no environment env")
    current_file = Path(__file__).resolve()
    target_dir = current_file.parent.parent.parent
    dotenv_file_name = f".env.{environment}"
    dotenv_file_path = target_dir / dotenv_file_name
    print(dotenv_file_path)
    if not dotenv_file_path.exists():
        raise Exception(f"env file not exist, dotenv_file_path:{dotenv_file_path}")
    load_dotenv(dotenv_path=dotenv_file_path)
    print(f"current environment : {environment}")


def is_dev_environment():
    from src.setting import get_settings

    setting = get_settings()
    return setting.environment == "dev"
