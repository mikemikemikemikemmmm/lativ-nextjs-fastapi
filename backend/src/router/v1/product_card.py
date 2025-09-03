from fastapi import APIRouter
from src.db import SessionDepend
from sqlalchemy import text, func, and_
from src.models.product import ProductModel
from src.models.subProduct import SubProductModel
from src.models.gender import GenderModel
from typing import Optional

product_card_router = APIRouter()


# @product_card_router.get("/")
# def get_cards(
#     db: SessionDepend,
#     color_id: int | None = None,
#     series_id: int | None = None,
#     product_name: str | None = None,
# ):
#     query = db.query(
#         ProductModel.id,
#         ProductModel.name,
#         ProductModel.series_id,
#         ProductModel.img_url,
#         GenderModel.id.label("gender_id"),
#         GenderModel.name.label("gender_name"),
#         func.count(SubProductModel.id).label("sub_product_count"),
#     ).join(GenderModel, ProductModel.gender_id == GenderModel.id)

#     # LEFT JOIN sub_ProductModel
#     if color_id:
#         subq = (
#             db.query(ProductModel.id)
#             .join(
#                 SubProductModel,
#                 and_(
#                     SubProductModel.color_id == color_id,
#                     SubProductModel.product_id == ProductModel.id,
#                 ),
#             )
#             .subquery()  # <- 這裡變成子查詢
#         )
#         query.join(subq, subq.c.id == ProductModel.id)
#     elif series_id:
#         query.outerjoin(SubProductModel, SubProductModel.product_id == ProductModel.id)
#         query = query.filter(ProductModel.series_id == series_id)
#     elif product_name:
#         query.outerjoin(SubProductModel, SubProductModel.product_id == ProductModel.id)
#         query = query.filter(ProductModel.name.ilike(f"%{product_name}%"))

#     # 分組與排序
#     query = query.group_by(ProductModel.id, GenderModel.id, GenderModel.name).order_by(
#         ProductModel.order
#     )
#     print(str(query))
#     result = query.all()

#     # 轉成 dict
#     return [
#         {
#             "id": r.id,
#             "name": r.name,
#             "series_id": r.series_id,
#             "img_url": r.img_url,
#             "gender_id": r.gender_id,
#             "gender_name": r.gender_name,
#             "sub_product_count": r.sub_product_count,
#         }
#         for r in result
#     ]


def add_common_query(query_str: str):
    return (
        """
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
        """
        + query_str
        + """
            GROUP BY p.id,g.id,g.name
            ORDER BY p."order"
        """
    )


@product_card_router.get("/by_color_id/{color_id}")
def get_card_by_color_id(db: SessionDepend, color_id: int):
    stmt = text(
        add_common_query("""
            INNER JOIN (
                SELECT p.id
                FROM product p
                INNER JOIN sub_product sp
                ON sp.product_id = p.id AND sp.color_id = :color_id
            ) AS having_color_product hcp
            ON p.id = hcp.id
            INNER JOIN sub_product sp
            ON sp.product_id = p.id
        """)
    ).bindparams(color_id=color_id)
    print(str(stmt))
    result = db.execute(stmt).mappings().all()
    return result


@product_card_router.get("/by_series_id/{series_id}")
def get_card_by_series_id(db: SessionDepend, series_id: int):
    stmt = text(
        add_common_query("""
        LEFT JOIN sub_product  sp
        ON sp.product_id = p.id
        WHERE p.series_id = :series_id
        """)
    ).bindparams(series_id=series_id)

    result = db.execute(stmt).mappings().all()
    return result


@product_card_router.get("/by_product_name/{product_name}")
def get_by_product_name(db: SessionDepend, product_name: str):
    stmt = text(
        add_common_query("""
        LEFT JOIN sub_product sp
        ON sp.product_id = p.id
        WHERE p.name LIKE :product_name
        """)
    ).bindparams(product_name=f"%{product_name}%")
    result = db.execute(stmt).mappings().all()
    return result


@product_card_router.get("/")
def get_cards(
    db: SessionDepend,
    series_id: int | None = None,
    color_id: int | None = None,
    product_name: str | None = None,
):
    if series_id:
        stmt = text(
            add_common_query("""
            LEFT JOIN sub_product  sp
            ON sp.product_id = p.id
            WHERE p.series_id = :series_id
            """)
        ).bindparams(series_id=series_id)
    elif color_id:
        stmt = text(
            add_common_query("""
                INNER JOIN (
                    SELECT p.id
                    FROM product p
                    INNER JOIN sub_product sp
                    ON sp.product_id = p.id AND sp.color_id = :color_id
                ) AS having_color_product
                ON p.id = having_color_product.id
                INNER JOIN sub_product sp
                ON sp.product_id = p.id
            """)
        ).bindparams(color_id=color_id)
    elif product_name:
        stmt = text(
            add_common_query("""
            LEFT JOIN sub_product sp
            ON sp.product_id = p.id
            WHERE p.name LIKE :product_name
            """)
        ).bindparams(product_name=f"%{product_name}%")
    else:
        stmt = text(
            add_common_query("""
            LEFT JOIN sub_product sp
            ON sp.product_id = p.id
         """) + " LIMIT 5"
        )

    result = db.execute(stmt).mappings().all()
    return result
