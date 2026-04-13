from functools import lru_cache
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    sql_url: str = os.getenv("SQL_URL", "")
    environment: str = os.getenv("ENVIRONMENT", "")
    frontend_admin_origin: str = os.getenv("FRONTEND_ADMIN_ORIGIN", "")
    frontend_guest_origin: str = os.getenv("FRONTEND_GUEST_ORIGIN", "")
    monitor_origin:str = os.getenv("MONITOR_ORIGIN","")
    admin_password:str = os.getenv("ADMIN_PASSWORD","")
    jwt_key:str = os.getenv("JWT_KEY","")
    log_dir:str = os.getenv("LOG_DIR","")
    port:str = os.getenv("PORT","")
    img_max_size_mb: int = int(os.getenv("IMG_MAX_SIZE_MB", "5"))
    gcp_storage_bucket: str = os.getenv("GCP_STORAGE_BUCKET", "")
    google_application_credentials: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")

settings = Settings()

empty_fields = [k for k, v in settings.model_dump().items() if v == ""]
if empty_fields:
    print("以下環境變數欄位是空字串:", empty_fields)
else:
    print("所有環境變數欄位都有值")

print(settings.google_application_credentials)
@lru_cache
def get_settings():
    return Settings()

def is_dev_environment():
    return get_settings().environment == "dev"