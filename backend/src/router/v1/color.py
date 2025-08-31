from fastapi import APIRouter, File, Form, UploadFile
from src.db import SessionDepend
from src.models.color import ColorModel, UpdateSchema
from src.service.common import common_service
from src.errorHandler._global import ErrorHandler
from src.service.img import upload_img_to_s3, delete_img_from_s3

color_router = APIRouter()


@color_router.get("/")
def get_all(db: SessionDepend):
    return common_service.get_all(db, ColorModel)


@color_router.post("/")
def create_one(
    db: SessionDepend,
    color_name: str = Form(...),
    file: UploadFile = File(None),
):
    obj_file_name, error = upload_img_to_s3(file, "color")
    if not obj_file_name:
        print(error)
        return ErrorHandler.raise_500_server_error("新增顏色失敗")
    try:
        new_data = ColorModel(name=color_name, img_url=obj_file_name)
        db.add(new_data)
        db.commit()
        db.refresh(new_data)
        return new_data
    except Exception as e:
        print(e)
        try:
            delete_img_from_s3(obj_file_name)
        except Exception as del_e:
            print(f"S3 rollback 失敗: {del_e}")
        return ErrorHandler.raise_500_server_error("新增顏色失敗")


@color_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return common_service.update_one_by_id(db, ColorModel, update_data, id)


@color_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    target = db.query(ColorModel).filter(ColorModel.id == id).first()
    if not target:
        return ErrorHandler.raise_404_not_found()
    delete_img = delete_img_from_s3(target.img_url)
    if not delete_img:
        return ErrorHandler.raise_500_server_error("刪除圖片檔案失敗")
    return common_service.delete_one_by_id(db, ColorModel, id)
