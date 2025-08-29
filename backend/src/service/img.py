import boto3
from mypy_boto3_s3 import S3Client
from src.setting import get_settings
from fastapi import UploadFile
import uuid

setting = get_settings()
s3_client: S3Client = boto3.client(
    "s3",
    aws_access_key_id=setting.aws_access_key_id,
    aws_secret_access_key=setting.aws_secret_access_key,
)


def upload_img_to_s3(file: UploadFile) -> tuple[str, str]:
    if not file.filename:
        return ("", "no filename")
    try:
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        s3_client.upload_fileobj(file.file, setting.s3_bucket_name, unique_filename)
        print("上傳成功")
        return (",", "")
    except Exception as e:
        print(f"上傳失敗: {e}")
        return (",", e.__str__())


def delete_img_from_s3(object_file_name: str) -> bool:
    """
    從 S3 刪除圖片
    :param s3_key: S3 上的檔名
    :return: 是否成功
    """
    try:
        s3_client.delete_object(Bucket=setting.s3_bucket_name, Key=object_file_name)
        print("刪除成功")
        return True
    except Exception as e:
        print(f"刪除失敗: {e}")
        return False
