from fastapi import APIRouter
from src.db import SessionDepend
from sqlalchemy import text

product_card_router = APIRouter()


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
async def get_card_by_color_id(db: SessionDepend, color_id: int):
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
    
    result = await db.execute(stmt)
    return result.mappings().all()


@product_card_router.get("/by_series_id/{series_id}")
async def get_card_by_series_id(db: SessionDepend, series_id: int):
    stmt = text(
        add_common_query("""
        LEFT JOIN sub_product  sp
        ON sp.product_id = p.id
        WHERE p.series_id = :series_id
        """)
    ).bindparams(series_id=series_id)

    result = await db.execute(stmt)
    return result.mappings().all()


@product_card_router.get("/by_product_name/{product_name}")
async def get_by_product_name(db: SessionDepend, product_name: str):
    stmt = text(
        add_common_query("""
        LEFT JOIN sub_product sp
        ON sp.product_id = p.id
        WHERE p.name LIKE :product_name
        """)
    ).bindparams(product_name=f"%{product_name}%")

    result = await db.execute(stmt)
    return result.mappings().all()


@product_card_router.get("/")
async def get_cards(
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

    result = await db.execute(stmt)
    return result.mappings().all()