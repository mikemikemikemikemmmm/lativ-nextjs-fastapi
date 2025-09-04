from fastapi import APIRouter, File, Form, UploadFile
from src.db import SessionDepend
from src.models.color import ColorModel, UpdateSchema
from src.service.common import common_service
from src.errorHandler._global import ErrorHandler
from src.service.img import upload_img_to_s3, delete_img_from_s3
from sqlalchemy import text
from typing import Optional

color_router = APIRouter()


@color_router.get("/")
def get_all(db: SessionDepend):
    stmt = text("""
        SELECT 
            c.id,
            c.name,
            c.img_url,
            COUNT(sp.id) as sub_product_count
        FROM color c
        LEFT JOIN sub_product sp
            ON sp.color_id = c.id 
        GROUP BY c.id,c.name,c.img_url
    """)
    return db.execute(stmt).mappings().all()
    # return common_service.get_all(db, ColorModel)


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
def update_one(
    id: int,
    db: SessionDepend,
    color_name: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    try:
        # 先查找既有資料
        item = db.query(ColorModel).filter(ColorModel.id == id).first()
        if not item:
            return ErrorHandler.raise_404_not_found("物件不存在")

        # 如果有上傳新圖片才更新
        if file:
            obj_file_name, error = upload_img_to_s3(file, "color")
            if not obj_file_name:
                print(error)
                return ErrorHandler.raise_500_server_error("圖片更新失敗")

            # 刪除舊圖片（如果有需要）
            try:
                if item.img_url:
                    delete_img_from_s3(item.img_url)
            except Exception as del_e:
                print(f"S3 舊圖片刪除失敗: {del_e}")

            item.img_url = obj_file_name

        # 更新欄位
        item.name = color_name

        db.commit()
        db.refresh(item)
        return item

    except Exception as e:
        print(e)
        return ErrorHandler.raise_500_server_error("更新產品失敗")


@color_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    item = db.query(ColorModel).filter(ColorModel.id == id).first()
    if not item:
        return ErrorHandler.raise_404_not_found("物件不存在")
    # 刪除 S3 圖片
    try:
        delete_img_from_s3(item.img_url)
    except Exception as del_e:
        # 可以改成 logging
        print(f"S3 舊圖片刪除失敗: {del_e}")

    # 刪除資料庫記錄
    try:
        db.delete(item)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(e)
        return ErrorHandler.raise_500_server_error(detail="刪除失敗")
