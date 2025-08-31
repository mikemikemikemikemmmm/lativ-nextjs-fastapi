from fastapi import APIRouter
from src.db import SessionDepend
from src.models.subProduct import CreateSchema, SubProductModel, UpdateSchema
from src.service.common import common_service
from sqlalchemy import text

sub_product_router = APIRouter()


@sub_product_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return common_service.create_one(db, SubProductModel, create_data)


@sub_product_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return common_service.update_one_by_id(db, SubProductModel, update_data, id)


@sub_product_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return common_service.delete_one_by_id(db, SubProductModel, id)


@sub_product_router.get("/sub_product/modal/{product_id}")
def get_at_modal_by_product_id(db: SessionDepend, product_id: int):
    stmt = text("""
        SELECT
            sp.id,
            sp.price,
            sp.img_url,
            c.id AS color_id,
            c.name AS color_name,
            array_agg(s.id ORDER BY s."order") AS size_ids
        FROM sub_product sp
        INNER JOIN product p
            ON p.id = :product_id
        INNER JOIN color c
            ON c.id = sp.color_id
        LEFT JOIN size_sub_product ssp
            ON ssp.sub_product_id = sp.id
        INNER JOIN size s
            ON ssp.size_id = s.id
        GROUP BY sp.id, sp.price, sp.img_url, c.id, c.name
        ORDER BY sp."order"
    """)

    result = db.execute(stmt, {"product_id": product_id}).fetchall()

    # 將 SQLAlchemy Row 轉換成字典列表
    return [
        {
            "id": row.id,
            "price": row.price,
            "img_url": row.img_url,
            "color_id": row.color_id,
            "color_name": row.color_name,
            "size_ids": row.size_ids,  # 直接是整數陣列
        }
        for row in result
    ]
