from src.db import SessionDepend
from src.models.nav import NavModel
from src.service.common import common_service
from src.errorHandler._global import ErrorHandler
from fastapi import APIRouter, File, Form, UploadFile
from sqlalchemy import select
from src.service.img import upload_img_to_s3, delete_img_from_s3
from typing import Optional

nav_router = APIRouter()


@nav_router.get("/nav_route/{nav_route}")
async def get_by_route(nav_route: str, db: SessionDepend):
    stmt = select(NavModel).where(NavModel.route == nav_route)
    result = await db.execute(stmt)
    target = result.scalars().first()
    if not target:
        return ErrorHandler.raise_404_not_found()
    return target


@nav_router.get("/")
async def get_all(db: SessionDepend):
    return await common_service.get_all(db, NavModel)


@nav_router.put("/switch_order/{id1}/{id2}")
async def switch_order(db: SessionDepend, id1: int, id2: int):
    return await common_service.switch_order(db, NavModel, id1, id2)


@nav_router.post("/")
async def create_one(
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
        order = await common_service.get_max_order(db, NavModel)
        new_data = NavModel(
            name=name, route=route, order=order, img_file_name=obj_file_name
        )
        db.add(new_data)
        await db.commit()
        await db.refresh(new_data)
        return new_data
    except Exception as e:
        print(e)
        try:
            delete_img_from_s3(obj_file_name)
        except Exception as del_e:
            print(f"S3 rollback 失敗: {del_e}")
        return ErrorHandler.raise_500_server_error("新增失敗")


@nav_router.put("/{id}")
async def update_one(
    id: int,
    db: SessionDepend,
    name: str = Form(...),
    route: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    try:
        stmt = select(NavModel).where(NavModel.id == id)
        result = await db.execute(stmt)
        item = result.scalars().first()
        if not item:
            return ErrorHandler.raise_404_not_found("物件不存在")

        if file:
            obj_file_name, error = upload_img_to_s3(file, "nav_index")
            if not obj_file_name:
                print(error)
                return ErrorHandler.raise_500_server_error("圖片更新失敗")

            try:
                if item.img_file_name:
                    delete_img_from_s3(item.img_file_name)
            except Exception as del_e:
                print(f"S3 舊圖片刪除失敗: {del_e}")

            item.img_file_name = obj_file_name

        item.name = name
        item.route = route
        await db.commit()
        await db.refresh(item)
        return item

    except Exception as e:
        print(e)
        return ErrorHandler.raise_500_server_error("更新失敗")


@nav_router.delete("/{id}")
async def delete_one(db: SessionDepend, id: int):
    stmt = select(NavModel).where(NavModel.id == id)
    result = await db.execute(stmt)
    item = result.scalars().first()
    if not item:
        return ErrorHandler.raise_404_not_found("物件不存在")

    try:
        delete_img_from_s3(item.img_file_name)
    except Exception as del_e:
        print(f"S3 舊圖片刪除失敗: {del_e}")

    try:
        await db.delete(item)
        await db.commit()
        return True
    except Exception as e:
        await db.rollback()
        print(e)
        return ErrorHandler.raise_500_server_error(detail="刪除失敗")