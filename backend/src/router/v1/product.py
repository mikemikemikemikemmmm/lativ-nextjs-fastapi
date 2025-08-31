from fastapi import APIRouter
from src.db import SessionDepend
from src.models.product import CreateSchema, ProductModel, UpdateSchema
from src.service.common import common_service
from sqlalchemy import text

product_router = APIRouter()


@product_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return common_service.create_one(db, ProductModel, create_data)


@product_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return common_service.update_one_by_id(db, ProductModel, update_data, id)


@product_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return common_service.delete_one_by_id(db, ProductModel, id)


# @product_router.get("/modal/{id}")
# def get_at_modal(db: SessionDepend, id: int):
#     stmt = text("""
            

#         """)

#     return common_service.delete_one_by_id(db, ProductModel, id)

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
        INNER JOIN sub_product sp
            ON sp.product_id = p.id
        WHERE p.series_id = :series_id
        GROUP BY p.id,g.id,g.name
        ORDER BY p."order"
    """).bindparams(series_id=series_id)

    result = db.execute(stmt).mappings().all()
    return result

# @product_router.get("/modal_detail/{product_id}")
# def get_modal_detail(db: SessionDepend, product_id: int):
#     stmt = text("""
#         SELECT 
#             p.id,
#             p.name,
#             p.series_id,
#             p.img_url,
#             g.name AS gender_name,
#             g.id AS gender_id,
#             COUNT(sp.id) AS sub_product_count
#         FROM product p
#         INNER JOIN gender g
#             ON g.id = p.gender_id
#         INNER JOIN sub_product sp
#             ON sp.product_id = p.id
#         WHERE p.series_id = :series_id
#         GROUP BY p.id,g.id,g.name
#         ORDER BY p."order"
#     """).bindparams(series_id=series_id)

#     result = db.execute(stmt).mappings().all()
#     return result
