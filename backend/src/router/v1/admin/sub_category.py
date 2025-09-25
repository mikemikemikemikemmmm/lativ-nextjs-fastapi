from fastapi import APIRouter
from src.db import SessionDepend
from src.models.subCategory import CreateSchema, SubCategoryModel, UpdateSchema
from src.service.common import common_service
from pydantic import BaseModel as BasePydanticSchema
from sqlalchemy import text,select
from src.errorHandler._global import ErrorHandler

sub_category_router = APIRouter()




@sub_category_router.get("/category_id/{category_id}")
async def get_sub_category_by_category_id(db: SessionDepend, category_id: int):
    stmt = select(SubCategoryModel).where(SubCategoryModel.category_id == category_id).order_by(SubCategoryModel.order)
    result = await db.execute(stmt)
    return result.scalars().all()


@sub_category_router.get("/routes/{nav_route}/{category_route}/{sub_category_route}")
async def get_sub_category_by_routes(
    db: SessionDepend, nav_route: str, category_route: str, sub_category_route: str
):
    stmt = text("""
        SELECT sc.name, sc.id
        FROM sub_category sc
        INNER JOIN category c 
            ON c.id = sc.category_id AND c.route = :category_route
        INNER JOIN nav n
            ON n.id = c.nav_id AND n.route = :nav_route
        WHERE sc.route = :sub_category_route
        ORDER BY sc."order"
        LIMIT 1 
    """)

    result = await db.execute(
        stmt,
        {
            "category_route": category_route,
            "nav_route": nav_route,
            "sub_category_route": sub_category_route,
        },
    )
    row = result.fetchone()
    if not row:
        return ErrorHandler.raise_404_not_found()

    return SubCategoryModel(id=row.id, name=row.name)


@sub_category_router.post("/")
async def create_one(db: SessionDepend, create_data: CreateSchema):
    return await common_service.create_one(db, SubCategoryModel, create_data)


@sub_category_router.put("/switch_order/{id1}/{id2}")
async def switch_order(db: SessionDepend, id1: int, id2: int):
    return await common_service.switch_order(db, SubCategoryModel, id1, id2)


@sub_category_router.put("/{id}")
async def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return await common_service.update_one_by_id(db, SubCategoryModel, update_data, id)


@sub_category_router.delete("/{id}")
async def delete_one(db: SessionDepend, id: int):
    return await common_service.delete_one_by_id(db, SubCategoryModel, id)