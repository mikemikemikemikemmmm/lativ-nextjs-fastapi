from fastapi import APIRouter, File, Form, UploadFile
from src.db import SessionDepend
from src.models.subProduct import SubProductModel
from src.service.common import common_service
from sqlalchemy import select, delete
from src.service.img import upload_img_to_s3, delete_img_from_s3
from src.errorHandler._global import ErrorHandler
from src.models.size import SizeModel
from src.models.sizeSubproduct import SizeSubProductModel
import json

from typing import Optional

sub_product_router = APIRouter()

@sub_product_router.post("/")
async def create_one(
    db: SessionDepend,
    price: int = Form(...),
    color_id: int = Form(...),
    product_id: int = Form(...),
    size_ids: str = Form(...),
    file: UploadFile = File(...),
):
    try:
        json_size_ids = json.loads(size_ids)
        int_size_ids = [int(x) for x in json_size_ids]
    except Exception:
        return ErrorHandler.raise_500_server_error("尺寸格式錯誤")

    stmt = select(SizeModel).where(SizeModel.id.in_(int_size_ids))
    result = await db.execute(stmt)
    sizes = result.scalars().all()

    if len(sizes) != len(json_size_ids):
        return ErrorHandler.raise_500_server_error("新增副產品失敗，尺寸有誤")

    obj_file_name, error = upload_img_to_s3(file, "sub_product")
    if not obj_file_name:
        return ErrorHandler.raise_500_server_error("新增副產品失敗，上傳圖片有誤")

    order = await common_service.get_max_order(db, SubProductModel)
    new_data = SubProductModel(
        price=price,
        color_id=color_id,
        img_file_name=obj_file_name,
        order=order,
        product_id=product_id,
        sizes=[]
    )

    db.add(new_data)
    await db.flush()  # 生成 new_data.id

    for size in sizes:
        new_data.sizes.append(
            SizeSubProductModel(sub_product_id=new_data.id, size_id=size.id)
        )

    try:
        await db.commit()
        await db.refresh(new_data)
        return new_data
    except Exception as e:
        print(e)
        await db.rollback()
        try:
            delete_img_from_s3(obj_file_name)
        except Exception as del_e:
            print(f"S3 rollback 失敗: {del_e}")
        return ErrorHandler.raise_500_server_error("新增副產品失敗")


@sub_product_router.put("/switch_order/{id1}/{id2}")
async def switch_order(db: SessionDepend, id1: int, id2: int):
    return await common_service.switch_order(db, SubProductModel, id1, id2)


@sub_product_router.put("/{sub_product_id}")
async def update_one(
    sub_product_id: int,
    db: SessionDepend,
    price: int = Form(...),
    color_id: int = Form(...),
    product_id: int = Form(...),
    size_ids: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    stmt = select(SubProductModel).where(SubProductModel.id == sub_product_id)
    result = await db.execute(stmt)
    sub_product = result.scalars().first()
    if not sub_product:
        return ErrorHandler.raise_500_server_error("副產品不存在")

    try:
        json_size_ids = json.loads(size_ids)
        int_size_ids = [int(x) for x in json_size_ids]
    except Exception:
        return ErrorHandler.raise_500_server_error("尺寸格式錯誤")

    stmt = select(SizeModel).where(SizeModel.id.in_(int_size_ids))
    result = await db.execute(stmt)
    sizes = result.scalars().all()
    if len(sizes) != len(json_size_ids):
        return ErrorHandler.raise_500_server_error("更新副產品失敗，尺寸有誤")

    old_file_name = sub_product.img_file_name
    obj_file_name: Optional[str] = None

    if file:
        obj_file_name, error = upload_img_to_s3(file, "sub_product")
        if not obj_file_name:
            return ErrorHandler.raise_500_server_error("更新副產品失敗，上傳圖片有誤")
        sub_product.img_file_name = obj_file_name

    sub_product.price = price
    sub_product.color_id = color_id
    sub_product.product_id = product_id

    stmt = delete(SizeSubProductModel).where(SizeSubProductModel.sub_product_id == sub_product.id)
    await db.execute(stmt)

    for size in sizes:
        db.add(SizeSubProductModel(sub_product_id=sub_product.id, size_id=size.id))

    try:
        await db.commit()
        await db.refresh(sub_product)

        if file and old_file_name:
            try:
                delete_img_from_s3(old_file_name)
            except Exception as del_e:
                print(f"S3 刪除舊圖片失敗: {del_e}")

        return sub_product
    except Exception as e:
        print(e)
        await db.rollback()
        if file and obj_file_name:
            try:
                delete_img_from_s3(obj_file_name)
            except Exception as del_e:
                print(f"S3 rollback 失敗: {del_e}")
        return ErrorHandler.raise_500_server_error("更新副產品失敗")


@sub_product_router.delete("/{id}")
async def delete_one(db: SessionDepend, id: int):
    stmt = select(SubProductModel).where(SubProductModel.id == id)
    result = await db.execute(stmt)
    sub_product = result.scalars().first()
    if not sub_product:
        return ErrorHandler.raise_404_not_found("物件不存在")

    if sub_product.img_file_name:
        try:
            delete_img_from_s3(sub_product.img_file_name)
        except Exception as del_e:
            print(f"S3 舊圖片刪除失敗: {del_e}")

    stmt = delete(SizeSubProductModel).where(SizeSubProductModel.sub_product_id == sub_product.id)
    await db.execute(stmt)
    
    await db.delete(sub_product)

    try:
        await db.commit()
        return True
    except Exception as e:
        await db.rollback()
        print(e)
        return ErrorHandler.raise_500_server_error(detail="刪除物件失敗")