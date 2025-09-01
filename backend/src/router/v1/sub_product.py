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


@sub_product_router.get("/modal/{product_id}")
def get_at_modal_by_product_id(db: SessionDepend, product_id: int):

    stmt = text("""
        SELECT
            sp.id,
            sp.price,
            sp.img_file_name,
            c.id AS color_id,
            c.name AS color_name,
            c.img_url AS color_img_url,
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
        GROUP BY sp.id, sp.price, sp.img_file_name, c.id, c.name,c.img_url
        ORDER BY sp."order"
    """)

    result = db.execute(stmt, {"product_id": product_id}).fetchall()
    return [
        {
            "id": row.id,
            "price": row.price,
            "img_file_name": row.img_file_name,
            "color_id": row.color_id,
            "color_name": row.color_name,
            "color_img_url":row.color_img_url,
            "size_ids": row.size_ids,  # 直接是整數陣列
        }
        for row in result
    ]
