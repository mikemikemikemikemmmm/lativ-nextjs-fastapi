from fastapi import APIRouter, File, Form, UploadFile
from src.db import SessionDepend
from src.models.product import ProductModel
from src.service.common import common_service
from sqlalchemy import text,select
from src.errorHandler._global import ErrorHandler
from src.service.img import save_img, delete_img
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
    obj_file_name, error = save_img(file, "product")
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
            delete_img(obj_file_name)
        except Exception as del_e:
            print(f"rollback 失敗: {del_e}")
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
            obj_file_name, error = save_img(file, "product")
            if not obj_file_name:
                print(error)
                return ErrorHandler.raise_500_server_error("圖片更新失敗")
            try:
                if product.img_url:
                    delete_img(product.img_url)
            except Exception as del_e:
                print(f"舊圖片刪除失敗: {del_e}")

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
        delete_img(product.img_url)
    except Exception as del_e:
        print(f"舊圖片刪除失敗: {del_e}")

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
            (SELECT COUNT(*) FROM sub_product sp_c WHERE sp_c.product_id = p.id) AS sub_product_count,
            p.series_id,
            COALESCE(
                (
                    SELECT json_group_array(json_object(
                        'id', sp.id,
                        'price', sp.price,
                        'img_file_name', sp.img_file_name,
                        'color_id', col.id,
                        'color_name', col.name,
                        'color_img_url', col.img_url,
                        'size_ids', (
                            SELECT json_group_array(ssp.size_id)
                            FROM (
                                SELECT ssp2.size_id
                                FROM size_sub_product ssp2
                                JOIN size s ON ssp2.size_id = s.id
                                WHERE ssp2.sub_product_id = sp.id
                                ORDER BY s."order"
                            ) ssp
                        )
                    ))
                    FROM (
                        SELECT sp2.id, sp2.price, sp2.img_file_name, sp2.color_id
                        FROM sub_product sp2
                        WHERE sp2.product_id = p.id
                        ORDER BY sp2."order"
                    ) sp
                    JOIN color col ON col.id = sp.color_id
                ),
                '[]'
            ) AS sub_products
        FROM product p
        JOIN gender g ON p.gender_id = g.id
        WHERE p.id = :productId
    """)

    result = await db.execute(stmt, {"productId": productId})
    record = result.mappings().first()
    if not record:
        return ErrorHandler.raise_404_not_found()
    return record