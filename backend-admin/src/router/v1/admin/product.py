from fastapi import APIRouter, File, Form, UploadFile
from src.db import SessionDepend
from src.models.product import ProductModel
from src.service.common import common_service
from sqlalchemy import text,select
from src.errorHandler._global import ErrorHandler
from src.service.img import upload_img_to_s3, delete_img_from_s3
from typing import Optional

product_router = APIRouter()


@product_router.post("/")
async def create_one(
    db: SessionDepend,
    product_name: str = Form(...),
    gender_id: int = Form(...),
    series_id: int = Form(...),
    file: UploadFile = File(...),
):
    obj_file_name, error = upload_img_to_s3(file, "product")
    if not obj_file_name:
        print(error)
        return ErrorHandler.raise_500_server_error("新增產品失敗")
    try:
        order = await common_service.get_max_order(db, ProductModel)
        new_data = ProductModel(
            name=product_name,
            gender_id=gender_id,
            series_id=series_id,
            img_url=obj_file_name,
            order=order,
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
        return ErrorHandler.raise_500_server_error("新增產品失敗")


@product_router.put("/switch_order/{id1}/{id2}")
async def switch_order(db: SessionDepend, id1: int, id2: int):
    return await common_service.switch_order(db, ProductModel, id1, id2)


@product_router.put("/{id}")
async def update_one(
    id: int,
    db: SessionDepend,
    product_name: str = Form(...),
    gender_id: int = Form(...),
    file: Optional[UploadFile] = File(None),
):
    try:
        stmt = select(ProductModel).where(ProductModel.id == id)
        result = await db.execute(stmt)
        product = result.scalars().first()
        if not product:
            return ErrorHandler.raise_404_not_found("產品不存在")

        if file:
            obj_file_name, error = upload_img_to_s3(file, "product")
            if not obj_file_name:
                print(error)
                return ErrorHandler.raise_500_server_error("圖片更新失敗")
            try:
                if product.img_url:
                    delete_img_from_s3(product.img_url)
            except Exception as del_e:
                print(f"S3 舊圖片刪除失敗: {del_e}")

            product.img_url = obj_file_name

        product.name = product_name
        product.gender_id = gender_id
        await db.commit()
        await db.refresh(product)
        return product

    except Exception as e:
        print(e)
        return ErrorHandler.raise_500_server_error("更新產品失敗")


@product_router.delete("/{id}")
async def delete_one(db: SessionDepend, id: int):
    stmt = select(ProductModel).where(ProductModel.id == id)
    result = await db.execute(stmt)
    product = result.scalars().first()
    if not product:
        return ErrorHandler.raise_404_not_found("產品不存在")

    try:
        delete_img_from_s3(product.img_url)
    except Exception as del_e:
        print(f"S3 舊圖片刪除失敗: {del_e}")

    try:
        await db.delete(product)
        await db.commit()
        return True
    except Exception as e:
        await db.rollback()
        print(e)
        return ErrorHandler.raise_500_server_error(detail="刪除產品失敗")


@product_router.get("/{productId}")
async def get_all(db: SessionDepend, productId: int):
    stmt = text("""
        SELECT 
            p.id,
            p.img_url,
            p.name,
            g.name AS gender_name,
            g.id AS gender_id,
            COUNT(sp.id) AS sub_product_count,
            p.series_id,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', sp.id,
                        'price', sp.price,
                        'img_file_name', sp.img_file_name,
                        'color_id', c.id,
                        'color_name', c.name,
                        'color_img_url', c.img_url,
                        'size_ids', (
                            SELECT ARRAY_AGG(ssp.size_id ORDER BY s."order")
                            FROM size_sub_product ssp
                            JOIN size s ON ssp.size_id = s.id
                            WHERE ssp.sub_product_id = sp.id
                        )
                    ) ORDER BY sp."order"
                ) FILTER (WHERE sp.id IS NOT NULL), '[]'
            ) AS sub_products
        FROM product p
        JOIN gender g ON p.gender_id = g.id
        LEFT JOIN sub_product sp ON sp.product_id = p.id
        LEFT JOIN color c ON sp.color_id = c.id
        WHERE p.id = :productId
        GROUP BY p.id, p.img_url, p.name, g.name, g.id, p.series_id;
    """)

    result = await db.execute(stmt, {"productId": productId})
    record = result.mappings().first()
    if not record:
        return ErrorHandler.raise_404_not_found()
    return record