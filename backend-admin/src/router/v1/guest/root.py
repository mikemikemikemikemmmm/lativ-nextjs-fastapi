from fastapi import APIRouter
from src.db import SessionDepend
from sqlalchemy import text
from src.errorHandler._global import ErrorHandler

guest_router = APIRouter()

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
                (
                    SELECT json_group_array(json_object(
                        'id', sc2.id,
                        'route', sc2.route,
                        'name', sc2.name
                    ))
                    FROM (
                        SELECT sc3.id, sc3.route, sc3.name
                        FROM sub_category sc3
                        INNER JOIN series s2 ON s2.sub_category_id = sc3.id
                        WHERE sc3.category_id = c.id
                        AND EXISTS (
                            SELECT 1
                            FROM product p2
                            INNER JOIN sub_product sp2 ON sp2.product_id = p2.id
                            WHERE p2.series_id = s2.id
                        )
                        GROUP BY sc3.id, sc3.route, sc3.name, sc3."order"
                        ORDER BY sc3."order"
                    ) sc2
                ) AS sub_categorys
            FROM nav n
            INNER JOIN category c ON c.nav_id = n.id AND n.route = :nav_route
            WHERE EXISTS (
                SELECT 1
                FROM sub_category sc
                INNER JOIN series s ON s.sub_category_id = sc.id
                INNER JOIN product p ON p.series_id = s.id
                INNER JOIN sub_product sp ON sp.product_id = p.id
                WHERE sc.category_id = c.id
            )
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
                (
                    SELECT json_group_array(json_object(
                        'id', sc2.id,
                        'route', sc2.route,
                        'name', sc2.name
                    ))
                    FROM (
                        SELECT sc3.id, sc3.route, sc3.name
                        FROM sub_category sc3
                        INNER JOIN series s2 ON s2.sub_category_id = sc3.id
                        INNER JOIN product p2 ON p2.series_id = s2.id AND p2.id = :product_id
                        WHERE sc3.category_id = c.id
                        GROUP BY sc3.id, sc3.route, sc3.name, sc3."order"
                        ORDER BY sc3."order"
                    ) sc2
                ) AS sub_categorys
            FROM nav n
            INNER JOIN category c ON c.nav_id = n.id
            WHERE EXISTS (
                SELECT 1
                FROM sub_category sc
                INNER JOIN series s ON s.sub_category_id = sc.id
                INNER JOIN product p ON p.series_id = s.id AND p.id = :product_id
                WHERE sc.category_id = c.id
            )
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
            (
                SELECT json_group_array(json_object(
                    'id', p2.id,
                    'img_url', p2.img_url,
                    'name', p2.name,
                    'gender_id', g2.id,
                    'gender_name', g2.name,
                    'order', p2.p_order,
                    'sub_products', (
                        SELECT json_group_array(json_object(
                            'id', sp.id,
                            'price', sp.price,
                            'color_id', col.id,
                            'color_name', col.name,
                            'color_img_file_name', col.img_url
                        ))
                        FROM (
                            SELECT sp2.id, sp2.price, sp2.color_id
                            FROM sub_product sp2
                            WHERE sp2.product_id = p2.id
                            ORDER BY sp2."order"
                        ) sp
                        INNER JOIN color col ON col.id = sp.color_id
                    )
                ))
                FROM (
                    SELECT p3.id, p3.img_url, p3.name, p3."order" AS p_order, p3.gender_id
                    FROM product p3
                    WHERE p3.series_id = s.id
                    ORDER BY p3."order"
                ) p2
                INNER JOIN gender g2 ON g2.id = p2.gender_id
            ) AS products
        FROM nav n
        INNER JOIN category c
            ON c.nav_id = n.id AND n.route = :nav_route AND c.route = :category_route
        INNER JOIN sub_category sc
            ON sc.category_id = c.id AND sc.route = :sub_category_route
        INNER JOIN series s ON s.sub_category_id = sc.id
        ORDER BY s."order"
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
                SELECT json_group_array(json_object(
                    'id', sp.id,
                    'price', sp.price,
                    'color_id', col.id,
                    'color_name', col.name,
                    'color_img_file_name', col.img_url
                ))
                FROM (
                    SELECT sp2.id, sp2.price, sp2.color_id
                    FROM sub_product sp2
                    WHERE sp2.product_id = p.id
                    ORDER BY sp2."order"
                ) sp
                INNER JOIN color col ON col.id = sp.color_id
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
        ORDER BY p."order"
        """
    )
    result = (await db.execute(stmt, {"nav_route": nav_route})).mappings().all()
    return result


@guest_router.get("/products")
async def get_product_detail(db: SessionDepend, product_id: int):
    stmt = text(
        """
        SELECT
            p.id,
            p.img_url,
            p.name,
            g.name AS gender_name,
            COALESCE(
                (
                    SELECT json_group_array(json_object(
                        'id', sp.id,
                        'price', sp.price,
                        'img_file_name', sp.img_file_name,
                        'color_id', col.id,
                        'color_name', col.name,
                        'color_img_file_name', col.img_url,
                        'sizes', (
                            SELECT json_group_array(json_object('id', si.id, 'name', si.name))
                            FROM (
                                SELECT si2.id, si2.name
                                FROM size_sub_product ssp2
                                INNER JOIN size si2 ON si2.id = ssp2.size_id
                                WHERE ssp2.sub_product_id = sp.id
                                ORDER BY si2."order"
                            ) si
                        )
                    ))
                    FROM (
                        SELECT sp2.id, sp2.price, sp2.img_file_name, sp2.color_id
                        FROM sub_product sp2
                        WHERE sp2.product_id = p.id
                        ORDER BY sp2."order"
                    ) sp
                    INNER JOIN color col ON col.id = sp.color_id
                ),
                '[]'
            ) AS sub_products
        FROM product p
        INNER JOIN gender g ON g.id = p.gender_id
        WHERE p.id = :product_id
        """
    )
    result = (
        await db.execute(stmt, {"product_id": product_id})
    ).mappings().first()
    if not result:
        return ErrorHandler.raise_404_not_found()
    return result