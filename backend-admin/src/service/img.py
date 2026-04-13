import uuid
from fastapi import UploadFile
from src.setting import get_settings

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}


def _get_storage_client():
    import json
    import os
    from google.cloud import storage
    from google.oauth2 import service_account

    creds_env = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    if creds_env.strip().startswith("{"):
        info = json.loads(creds_env)
        credentials = service_account.Credentials.from_service_account_info(info)
        return storage.Client(credentials=credentials, project=info.get("project_id"))
    return storage.Client()


def _get_blob(bucket_name: str, blob_name: str):
    client = _get_storage_client()
    bucket = client.bucket(bucket_name)
    return bucket.blob(blob_name)


def save_img(file: UploadFile, file_name_prefix: str) -> tuple[str | None, str | None]:
    if not file.filename:
        return None, "no filename"
    file_extension = file.filename.rsplit(".", 1)[-1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        return None, f"不支援的檔案格式: {file_extension}"
    contents = file.file.read()
    setting = get_settings()
    if len(contents) > setting.img_max_size_mb * 1024 * 1024:
        return None, f"檔案超過大小限制 ({setting.img_max_size_mb} MB)"

    unique_filename = f"{file_name_prefix}-{uuid.uuid4()}.{file_extension}"
    blob_name = f"{setting.environment}/{unique_filename}"
    try:
        blob = _get_blob(setting.gcp_storage_bucket, blob_name)
        content_type = file.content_type or "application/octet-stream"
        blob.upload_from_string(contents, content_type=content_type)
        return unique_filename, None
    except Exception as e:
        return None, str(e)


def delete_img(file_name: str) -> bool:
    try:
        setting = get_settings()
        blob_name = f"{setting.environment}/{file_name}"
        blob = _get_blob(setting.gcp_storage_bucket, blob_name)
        if blob.exists():
            blob.delete()
        print("刪除圖片成功")
        return True
    except Exception as e:
        print(f"刪除圖片失敗: {e}")
        return False
