from fastapi import APIRouter, File, Form, UploadFile
from src.db import SessionDepend
from src.models.subProduct import SubProductModel
from src.service.common import common_service
from sqlalchemy import text
from src.service.img import upload_img_to_s3, delete_img_from_s3
from src.errorHandler._global import ErrorHandler
from src.models.size import SizeModel
from src.models.sizeSubproduct import SizeSubProductModel
import json

sub_product_router = APIRouter()


@sub_product_router.post("/")
def create_one(
    db: SessionDepend,
    price: int = Form(...),
    color_id: int = Form(...),
    product_id: int = Form(...),
    size_ids: str = Form(...),
    file: UploadFile = File(...),
):
    int_size_ids: list[int] = []
    json_size_ids: list[int] = []

    # 解析 size_ids
    if isinstance(size_ids, str):
        try:
            json_size_ids = json.loads(size_ids)
            int_size_ids = [int(x) for x in json_size_ids]
        except Exception:
            return ErrorHandler.raise_500_server_error("尺寸格式錯誤")

    sizes = db.query(SizeModel).filter(SizeModel.id.in_(int_size_ids)).all()
    if len(sizes) != len(json_size_ids):
        return ErrorHandler.raise_500_server_error("新增副產品失敗，尺寸有誤")

    obj_file_name, error = upload_img_to_s3(file, "sub_product")
    if not obj_file_name:
        return ErrorHandler.raise_500_server_error("新增副產品失敗，上傳圖片有誤")

    order = common_service.get_max_order(db, SubProductModel)
    new_data = SubProductModel(
        price=price,
        color_id=color_id,
        img_file_name=obj_file_name,
        order=order,
        product_id=product_id,
        sizes=[]
    )

    db.add(new_data)
    db.flush()  # 生成 new_data.id

    for size in sizes:
        new_data.sizes.append(
            SizeSubProductModel(sub_product_id=new_data.id, size_id=size.id)
        )

    try:
        db.commit()
        db.refresh(new_data)
        return new_data
    except Exception as e:
        print(e)
        db.rollback()
        try:
            delete_img_from_s3(obj_file_name)
        except Exception as del_e:
            print(f"S3 rollback 失敗: {del_e}")
        return ErrorHandler.raise_500_server_error("新增副產品失敗")


@sub_product_router.put("/switch_order/{id1}/{id2}")
def switch_order(db: SessionDepend, id1: int, id2: int):
    return common_service.switch_order(db, SubProductModel, id1, id2)


@sub_product_router.put("/{sub_product_id}")
def update_one(
    sub_product_id: int,
    db: SessionDepend,
    price: int = Form(...),
    color_id: int = Form(...),
    product_id: int = Form(...),
    size_ids: str = Form(...),
    file: UploadFile | None = File(None),  # PUT 可以選擇不更新圖片
):
    # 查找要更新的副產品
    sub_product = (
        db.query(SubProductModel).filter(SubProductModel.id == sub_product_id).first()
    )
    if not sub_product:
        return ErrorHandler.raise_500_server_error("副產品不存在")

    try:
        json_size_ids:list[int] = json.loads(size_ids)
        int_size_ids = [int(x) for x in json_size_ids]
    except Exception:
        return ErrorHandler.raise_500_server_error("尺寸格式錯誤")
    # 驗證尺寸是否存在
    sizes = db.query(SizeModel).filter(SizeModel.id.in_(int_size_ids)).all()
    if len(sizes) != len(json_size_ids):
        return ErrorHandler.raise_500_server_error("更新副產品失敗，尺寸有誤")

    old_file_name = sub_product.img_file_name
    obj_file_name: str | None = None
    # 如果有上傳新圖片就更新 S3
    if file:
        obj_file_name, error = upload_img_to_s3(file, "sub_product")
        if not obj_file_name:
            return ErrorHandler.raise_500_server_error("更新副產品失敗，上傳圖片有誤")
        sub_product.img_file_name = obj_file_name

    # 更新其他欄位
    sub_product.price = price
    sub_product.color_id = color_id
    sub_product.product_id = product_id
    # 安全更新 sizes
    db.query(SizeSubProductModel).filter(
        SizeSubProductModel.sub_product_id == sub_product.id
    ).delete(synchronize_session=False)

    for size in sizes:
        db.add(SizeSubProductModel(sub_product_id=sub_product.id, size_id=size.id))

    try:
        db.commit()
        db.refresh(sub_product)

        # 如果有新圖片，刪掉舊圖片
        if file and old_file_name:
            try:
                delete_img_from_s3(old_file_name)
            except Exception as del_e:
                print(f"S3 刪除舊圖片失敗: {del_e}")

        return sub_product
    except Exception as e:
        print(e)
        db.rollback()
        # 如果新圖片上傳了但更新失敗，刪掉新圖片
        if file and obj_file_name:
            try:
                delete_img_from_s3(obj_file_name)
            except Exception as del_e:
                print(f"S3 rollback 失敗: {del_e}")
        return ErrorHandler.raise_500_server_error("更新副產品失敗")

@sub_product_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    sub_product = db.query(SubProductModel).filter(SubProductModel.id == id).first()
    if not sub_product:
        return ErrorHandler.raise_404_not_found("物件不存在")
    
    # 刪除 S3 圖片
    try:
        if sub_product.img_file_name:
            delete_img_from_s3(sub_product.img_file_name)
    except Exception as del_e:
        print(f"S3 舊圖片刪除失敗: {del_e}")
    
    try:
        # 先刪掉多對多關聯
        db.query(SizeSubProductModel).filter(
            SizeSubProductModel.sub_product_id == sub_product.id
        ).delete(synchronize_session=False)
        
        # 再刪掉主表
        db.delete(sub_product)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(e)
        return ErrorHandler.raise_500_server_error(detail="刪除物件失敗")