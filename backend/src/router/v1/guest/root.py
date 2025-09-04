from fastapi import APIRouter
from src.db import SessionDepend
from sqlalchemy import text

guest_router = APIRouter()


@guest_router.get("/navs")
def get_navs(db: SessionDepend):
    stmt = text(
        """
        SELECT 
            n.id,
            n.name,
            n.route,
            n.img_file_name
        FROM nav n
        """
    )
    result = db.execute(stmt).mappings().all()
    return result


@guest_router.get("/categorys")
def get_categorys(db: SessionDepend, nav_route: str | None, product_id: int | None):
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
            LEFT JOIN category c
                ON c.nav_id = n.id
            LEFT JOIN sub_category sc
                ON sc.category_id = c.id
            WHERE n.route = :nav_route
            GROUP BY c.id, c.name, c.route, c."order", n.route
            ORDER BY c."order"
            """
        )
        result = db.execute(stmt, {"nav_route": nav_route}).mappings().all()
        return result
    if product_id:
        stmt = text(
            """
            SELECT 
                c.id,
                c.route,
                c.name,
                json_agg(
                    json_build_object(
                        'id', sc.id,
                        'route', sc.route,
                        'name', sc.name
                    )
                    ORDER BY sc."order"
                ) AS sub_categorys 
            FROM nav n
            LEFT JOIN category c
                ON c.nav_id = n.id
            LEFT JOIN sub_category sc
                ON sc.category_id = c.id
            INNER JOIN series s
                ON s.sub_category_id = sc.id
            INNER JOIN product p
                ON p.id =:product_id AND p.series_id = s.id
            GROUP BY c.id, c.name, c.route, c."order"
            ORDER BY c."order"
            """
        )
        result = db.execute(stmt, {"product_id": product_id}).mappings().all()
        return result



@guest_router.get("/product_cards")
def get_product_cards(db: SessionDepend, nav_route: str | None, sub_category_route: int | None):
    pass

@guest_router.get("/product_detail")
def get_product_detail(db: SessionDepend, product_id:int):
    pass