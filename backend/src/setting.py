from functools import lru_cache
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    sql_url: str = os.getenv("SQL_URL", "")
    environment: str = os.getenv("ENVIRONMENT", "")
    frontend_admin_origin: str = os.getenv("FRONETEND_ADMIN_ORIGIN", "")
    frontend_guest_origin: str = os.getenv("FRONETEND_GUEST_ORIGIN", "")
    aws_access_key_id: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    aws_secret_access_key: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    aws_region: str = os.getenv("AWS_REGION", "")
    s3_bucket_name: str = os.getenv("S3_BUCKET_NAME", "")

settings = Settings()

empty_fields = [k for k, v in settings.model_dump().items() if v == ""]
if empty_fields:
    print("以下環境變數欄位是空字串:", empty_fields)
else:
    print("所有環境變數欄位都有值")


@lru_cache
def get_settings():
    return Settings()

def is_dev_environment():
    return get_settings().environment == "dev"