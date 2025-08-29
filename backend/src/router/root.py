from fastapi import APIRouter, UploadFile
from src.service.img import upload_img_to_s3, delete_img_from_s3
from .v1.root import v1_router

root_router = APIRouter()
root_router.include_router(v1_router, prefix="/v1")


# @root_router.delete("/img_file/{img_file_name}")
# def delete_file(img_file_name:str):
#     delete_img_from_s3(img_file_name)


# @root_router.post("/img_file")
# def upload_file(file: UploadFile):
#     (a, err) = upload_img_to_s3(file)
#     if err:
#         print(err)
#     else:
#         print(a)