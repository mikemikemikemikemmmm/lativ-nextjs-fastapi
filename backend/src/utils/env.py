import os
from dotenv import load_dotenv
def load_env():
    environment = os.getenv("ENVIRONMENT")
    if not environment:
        raise Exception("no environment env")
    dotenv_file_path = f".env.{environment}"
    load_dotenv(dotenv_path=dotenv_file_path)
    print(f"current environment : {environment}")

def is_dev_environment():
    from src.setting import get_settings
    setting = get_settings()
    return setting.environment == "dev"