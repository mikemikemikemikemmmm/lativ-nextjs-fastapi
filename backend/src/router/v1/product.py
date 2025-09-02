from fastapi import APIRouter, File, Form, UploadFile
from src.db import SessionDepend
from src.models.product import ProductModel
from src.service.common import common_service
from sqlalchemy import text
from src.errorHandler._global import ErrorHandler
from src.service.img import upload_img_to_s3, delete_img_from_s3
from typing import Optional

product_router = APIRouter()


@product_router.post("/")
def create_one(
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
        order = common_service.get_max_order(db, ProductModel)
        new_data = ProductModel(
            name=product_name,
            gender_id=gender_id,
            series_id=series_id,
            img_url=obj_file_name,
            order=order,
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
        return ErrorHandler.raise_500_server_error("新增產品失敗")


@product_router.put("/switch_order/{id1}/{id2}")
def switch_order(db: SessionDepend, id1: int, id2: int):
    return common_service.switch_order(db, ProductModel, id1, id2)


@product_router.put("/{id}")
def update_one(
    id: int,
    db: SessionDepend,
    product_name: str = Form(...),
    gender_id: int = Form(...),
    file: Optional[UploadFile] = File(None),
):
    try:
        # 先查找既有資料
        product = db.query(ProductModel).filter(ProductModel.id == id).first()
        if not product:
            return ErrorHandler.raise_404_not_found("產品不存在")

        # 如果有上傳新圖片才更新
        if file:
            obj_file_name, error = upload_img_to_s3(file, "product")
            if not obj_file_name:
                print(error)
                return ErrorHandler.raise_500_server_error("圖片更新失敗")

            # 刪除舊圖片（如果有需要）
            try:
                if product.img_url:
                    delete_img_from_s3(product.img_url)
            except Exception as del_e:
                print(f"S3 舊圖片刪除失敗: {del_e}")

            product.img_url = obj_file_name

        # 更新欄位
        product.name = product_name
        product.gender_id = gender_id

        db.commit()
        db.refresh(product)
        return product

    except Exception as e:
        print(e)
        return ErrorHandler.raise_500_server_error("更新產品失敗")


@product_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    product = db.query(ProductModel).filter(ProductModel.id == id).first()
    if not product:
        return ErrorHandler.raise_404_not_found("產品不存在")
    # 刪除 S3 圖片
    try:
        delete_img_from_s3(product.img_url)
    except Exception as del_e:
        # 可以改成 logging
        print(f"S3 舊圖片刪除失敗: {del_e}")

    # 刪除資料庫記錄
    try:
        db.delete(product)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(e)
        return ErrorHandler.raise_500_server_error(detail="刪除產品失敗")


@product_router.get("/cards/{series_id}")
def get_card_by_series_id(db: SessionDepend, series_id: int):
    stmt = text("""
        SELECT 
            p.id,
            p.name,
            p.series_id,
            p.img_url,
            g.name AS gender_name,
            g.id AS gender_id,
            COUNT(sp.id) AS sub_product_count
        FROM product p
        INNER JOIN gender g
            ON g.id = p.gender_id
        LEFT JOIN sub_product sp
            ON sp.product_id = p.id
        WHERE p.series_id = :series_id
        GROUP BY p.id,g.id,g.name
        ORDER BY p."order"
    """).bindparams(series_id=series_id)

    result = db.execute(stmt).mappings().all()
    return result


@product_router.get("/cards")
def get_all_cards(db: SessionDepend):
    stmt = text("""
        SELECT 
            p.id,
            p.name,
            p.series_id,
            p.img_url,
            g.name AS gender_name,
            g.id AS gender_id,
            COUNT(sp.id) AS sub_product_count
        FROM product p
        INNER JOIN gender g
            ON g.id = p.gender_id
        LEFT JOIN sub_product sp
            ON sp.product_id = p.id
        GROUP BY p.id,g.id,g.name
        ORDER BY p."order"
    """)

    result = db.execute(stmt).mappings().all()
    return result



    # name: string
    # id: number
    # gender_name: string
    # gender_id: number
    # series_id: number
    # img_url: string
    # sub_product_count: number
    # sub_products: SubProductRead[]

    # id: number
    # price: number
    # img_file_name: string
    # color_id: number
    # color_name: string
    # color_img_url: string
    # size_ids: number[]

@product_router.get("/{productId}")
def get_all(db: SessionDepend , productId: int):
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

    result = db.execute(stmt, {"productId": productId}).mappings().first()
    return result