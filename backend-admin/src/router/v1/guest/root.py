from fastapi import APIRouter
from src.db import SessionDepend
from sqlalchemy import text
from .login import login_router
from src.errorHandler._global import ErrorHandler

guest_router = APIRouter()
guest_router.include_router(login_router, prefix="/login")

@guest_router.get("/navs/{nav_route}")
async def get_nav_by_route(db: SessionDepend, nav_route: str):
    stmt = text(
        """
        SELECT
            n.id,
            n.name,
            n.route,
            n.img_file_name
        FROM nav n
        WHERE n.route = :nav_route AND EXISTS (
            SELECT 1
            FROM category c
            INNER JOIN sub_category sc ON sc.category_id = c.id
            INNER JOIN series s ON s.sub_category_id = sc.id
            INNER JOIN product p ON p.series_id = s.id
            INNER JOIN sub_product sp ON sp.product_id = p.id
            WHERE c.nav_id = n.id
        )
        ORDER BY n."order"
        """
    ).bindparams(nav_route=nav_route)

    result = (await db.execute(stmt)).mappings().first()
    if not result:
        return ErrorHandler.raise_404_not_found()
    return result


@guest_router.get("/navs")
async def get_navs(db: SessionDepend):
    stmt = text(
        """
        SELECT
            n.id,
            n.name,
            n.route,
            n.img_file_name
        FROM nav n
        WHERE EXISTS (
            SELECT 1
            FROM category c
            INNER JOIN sub_category sc ON sc.category_id = c.id
            INNER JOIN series s ON s.sub_category_id = sc.id
            INNER JOIN product p ON p.series_id = s.id
            INNER JOIN sub_product sp ON sp.product_id = p.id
            WHERE c.nav_id = n.id
        )
        ORDER BY n."order"
        """
    )
    result = (await db.execute(stmt)).mappings().all()
    return result


@guest_router.get("/categorys")
async def get_categorys(
    db: SessionDepend, nav_route: str | None = None, product_id: int | None = None
):
    if nav_route:
        stmt = text(
            """
            SELECT 
                c.id,
                c.route,
                c.name,
                n.route AS nav_route,
                json_agg(
                    json_build_object(
                        'id', sc.id,
                        'route', sc.route,
                        'name', sc.name
                    )
                    ORDER BY sc."order"
                ) AS sub_categorys 
            FROM nav n
            INNER JOIN category c 
                ON c.nav_id = n.id AND n.route = :nav_route
            INNER JOIN sub_category sc
                ON sc.category_id = c.id
            INNER JOIN series s
                ON s.sub_category_id = sc.id
            WHERE EXISTS (
                SELECT 1
                FROM product p
                INNER JOIN sub_product sp
                    ON sp.product_id = p.id
                WHERE p.series_id = s.id
            )
            GROUP BY c.id, c.name, c.route, c."order", n.route
            ORDER BY c."order"
            """
        )
        result = (await db.execute(stmt, {"nav_route": nav_route})).mappings().all()
        return result

    if product_id:
        stmt = text(
            """
            SELECT 
                c.id,
                c.route,
                c.name,
                n.route AS nav_route,
                json_agg(
                    json_build_object(
                        'id', sc.id,
                        'route', sc.route,
                        'name', sc.name
                    )
                    ORDER BY sc."order"
                ) AS sub_categorys 
            FROM nav n
            INNER JOIN category c 
                ON c.nav_id = n.id
            INNER JOIN sub_category sc
                ON sc.category_id = c.id
            INNER JOIN series s
                ON s.sub_category_id = sc.id
            WHERE EXISTS (
                SELECT 1
                FROM product p
                INNER JOIN sub_product sp
                    ON sp.product_id = p.id AND p.id = :product_id
                WHERE p.series_id = s.id
            )
            GROUP BY c.id, c.name, c.route, c."order", n.route
            ORDER BY c."order"
            """
        )
        result = (await db.execute(stmt, {"product_id": product_id})).mappings().all()
        return result


@guest_router.get("/series")
async def get_series(
    db: SessionDepend,
    nav_route: str,
    sub_category_route: str,
    category_route: str,
):
    stmt = text(
        """
        SELECT
            s.id,
            s.name,
            sc.name AS sub_category_name,
            json_agg(
                jsonb_build_object(
                    'id', p.id,
                    'img_url', p.img_url,
                    'name', p.name,
                    'gender_id', g.id,
                    'gender_name', g.name,
                    'order', p."order",
                    'sub_products', sp_json.sub_products
                ) ORDER BY p."order"
            ) AS products
        FROM nav n 
        INNER JOIN category c 
            ON c.nav_id = n.id AND n.route = :nav_route AND c.route = :category_route
        INNER JOIN sub_category sc 
            ON sc.category_id = c.id AND sc.route = :sub_category_route
        INNER JOIN series s ON s.sub_category_id = sc.id
        INNER JOIN product p ON p.series_id = s.id
        INNER JOIN gender g ON g.id = p.gender_id
        LEFT JOIN LATERAL (
            SELECT json_agg(
                    jsonb_build_object(
                        'id', sp.id,
                        'price', sp.price,
                        'color_id', col.id,
                        'color_name', col.name,
                        'color_img_file_name', col.img_url
                    ) ORDER BY sp."order"
                ) AS sub_products
            FROM sub_product sp
            INNER JOIN color col ON col.id = sp.color_id
            WHERE sp.product_id = p.id
        ) sp_json ON TRUE
        GROUP BY s.id, sc.name
        ORDER BY s."order";
        """
    )
    result = (
        await db.execute(
            stmt,
            {
                "nav_route": nav_route,
                "category_route": category_route,
                "sub_category_route": sub_category_route,
            },
        )
    ).mappings().all()
    return result


@guest_router.get("/products/nav_index")
async def get_product_cards(db: SessionDepend, nav_route: str):
    stmt = text(
        """
        SELECT
            p.id,
            p.img_url,
            p.name,
            g.name AS gender_name,
            (
                SELECT json_agg(
                    jsonb_build_object(
                        'id', sp.id,
                        'price', sp.price,
                        'color_id', col.id,
                        'color_name', col.name,
                        'color_img_file_name', col.img_url
                    ) ORDER BY sp."order"
                )
                FROM sub_product sp
                INNER JOIN color col ON col.id = sp.color_id
                WHERE sp.product_id = p.id
            ) AS sub_products
        FROM nav n
        INNER JOIN category c ON c.nav_id = n.id AND n.route = :nav_route
        INNER JOIN sub_category sc ON sc.category_id = c.id
        INNER JOIN series s ON s.sub_category_id = sc.id
        INNER JOIN product p ON p.series_id = s.id 
        INNER JOIN gender g ON g.id = p.gender_id
        WHERE EXISTS (
            SELECT 1
            FROM sub_product sp
            WHERE sp.product_id = p.id
        )
        GROUP BY p.id, p.name, p.img_url, g.name
        ORDER BY p."order";
        """
    )
    result = (await db.execute(stmt, {"nav_route": nav_route})).mappings().all()
    return result


@guest_router.get("/products")
async def get_product_detail(db: SessionDepend, product_id: int):
    stmt = text(
        """
        WITH subproduct_sizes AS (
            SELECT
                ssp.sub_product_id,
                jsonb_agg(
                    jsonb_build_object('id', si.id, 'name', si.name)
                    ORDER BY si."order"
                ) AS sizes
            FROM size_sub_product ssp
            INNER JOIN size si ON si.id = ssp.size_id
            GROUP BY ssp.sub_product_id
        ),
        sub_products_agg AS (
            SELECT
                sp.product_id,
                jsonb_agg(
                    jsonb_build_object(
                        'id', sp.id,
                        'price', sp.price,
                        'img_file_name', sp.img_file_name,
                        'color_id', col.id,
                        'color_name', col.name,
                        'color_img_file_name', col.img_url,
                        'sizes', COALESCE(sizes.sizes, '[]'::jsonb)
                    )
                    ORDER BY sp."order"
                ) AS sub_products
            FROM sub_product sp
            INNER JOIN color col ON col.id = sp.color_id
            LEFT JOIN subproduct_sizes sizes ON sizes.sub_product_id = sp.id
            GROUP BY sp.product_id
        )
        SELECT
            p.id,
            p.img_url,
            p.name,
            g.name AS gender_name,
            COALESCE(spa.sub_products, '[]'::jsonb) AS sub_products
        FROM product p
        INNER JOIN gender g ON g.id = p.gender_id
        LEFT JOIN sub_products_agg spa ON spa.product_id = p.id
        WHERE p.id = :product_id
        ORDER BY p."order";
        """
    )
    result = (
        await db.execute(stmt, {"product_id": product_id})
    ).mappings().first()
    if not result:
        return ErrorHandler.raise_404_not_found()
    return result