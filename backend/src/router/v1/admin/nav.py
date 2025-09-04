from src.db import SessionDepend
from src.models.nav import NavModel
from src.service.common import common_service
from src.errorHandler._global import ErrorHandler
from fastapi import APIRouter, File, Form, UploadFile
from src.models.product import ProductModel
from src.service.common import common_service
from sqlalchemy import text
from src.errorHandler._global import ErrorHandler
from src.service.img import upload_img_to_s3, delete_img_from_s3
from typing import Optional

nav_router = APIRouter()


@nav_router.get("/nav_route/{nav_route}")
def get_by_route(nav_route: str, db: SessionDepend):
    target = db.query(NavModel).filter(NavModel.route == nav_route).first()
    if not target:
        return ErrorHandler.raise_404_not_found()
    return target


@nav_router.get("/")
def get_all(db: SessionDepend):
    return common_service.get_all(db, NavModel)


@nav_router.put("/switch_order/{id1}/{id2}")
def switch_order(db: SessionDepend, id1: int, id2: int):
    return common_service.switch_order(db, NavModel, id1, id2)


# ------------------------------------------------------#
@nav_router.post("/")
def create_one(
    db: SessionDepend,
    name: str = Form(...),
    route: str = Form(...),
    file: UploadFile = File(...),
):
    obj_file_name, error = upload_img_to_s3(file, "nav_index")
    if not obj_file_name:
        print(error)
        return ErrorHandler.raise_500_server_error("新增失敗")
    try:
        order = common_service.get_max_order(db, NavModel)
        new_data = NavModel(
            name=name, route=route, order=order, img_file_name=obj_file_name
        )
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
        return ErrorHandler.raise_500_server_error("新增失敗")



@nav_router.put("/{id}")
def update_one(
    id: int,
    db: SessionDepend,
    name: str = Form(...),
    route: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    try:
        # 先查找既有資料
        item = db.query(NavModel).filter(NavModel.id == id).first()
        if not item:
            return ErrorHandler.raise_404_not_found("物件不存在")

        # 如果有上傳新圖片才更新
        if file:
            obj_file_name, error = upload_img_to_s3(file, "nav_index")
            if not obj_file_name:
                print(error)
                return ErrorHandler.raise_500_server_error("圖片更新失敗")

            # 刪除舊圖片（如果有需要）
            try:
                if item.img_file_name:
                    delete_img_from_s3(item.img_file_name)
            except Exception as del_e:
                print(f"S3 舊圖片刪除失敗: {del_e}")

            item.img_file_name = obj_file_name

        # 更新欄位
        item.name = name
        item.route = route
        db.commit()
        db.refresh(item)
        return item

    except Exception as e:
        print(e)
        return ErrorHandler.raise_500_server_error("更新失敗")


@nav_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    item = db.query(NavModel).filter(NavModel.id == id).first()
    if not item:
        return ErrorHandler.raise_404_not_found("物件不存在")
    # 刪除 S3 圖片
    try:
        delete_img_from_s3(item.img_file_name)
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
