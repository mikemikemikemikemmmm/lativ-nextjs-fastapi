import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from src.setting import get_settings
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}

# backend-admin/assets/{env}/
_ASSETS_DIR = Path(__file__).resolve().parent.parent.parent / "assets" / os.getenv("ENVIRONMENT", "dev")

def _get_assets_dir() -> Path:
    assets_dir = _ASSETS_DIR
    assets_dir.mkdir(parents=True, exist_ok=True)
    return assets_dir


def save_img(file: UploadFile, file_name_prefix: str) -> tuple[str | None, str | None]:
    if not file.filename:
        return None, "no filename"
    file_extension = file.filename.rsplit(".", 1)[-1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        return None, f"不支援的檔案格式: {file_extension}"
    contents = file.file.read()
    setting = get_settings()  # 確保設定已載入
    if len(contents) > setting.IMG_MAX_SIZE_MB * 1024 * 1024:
        return None, f"檔案超過大小限制 ({setting.IMG_MAX_SIZE_MB   } MB)"
    try:
        unique_filename = f"{file_name_prefix}-{uuid.uuid4()}.{file_extension}"
        dest = _get_assets_dir() / unique_filename
        dest.write_bytes(contents)
        return unique_filename, None
    except Exception as e:
        return None, str(e)


def delete_img(file_name: str) -> bool:
    try:
        target = _get_assets_dir() / file_name
        if target.exists():
            target.unlink()
        print("刪除圖片成功")
        return True
    except Exception as e:
        print(f"刪除圖片失敗: {e}")
        return False


