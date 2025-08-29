from fastapi import APIRouter
from sqlalchemy import select, func, asc, types, literal
from src.db import SessionDepend
from src.models.category import CategoryModel
from src.models.subCategory import SubCategoryModel

category_router = APIRouter()


@category_router.get("/")
def get_all_category_and_sub_categorys_by_nav_id(db: SessionDepend, nav_id: int):
    subquery = (
        select(
            SubCategoryModel.category_id,
            func.json_agg(
                func.json_build_object(
                    "id",
                    SubCategoryModel.id,
                    "name",
                    SubCategoryModel.name,
                    "order",
                    SubCategoryModel.order,
                    "route",
                    SubCategoryModel.route,
                ).order_by(asc(SubCategoryModel.order))
            ).label("sub_categorys"),
        ).group_by(SubCategoryModel.category_id)
    ).subquery()

    stmt = (
        select(
            func.json_agg(
                func.json_build_object(
                    "id",
                    CategoryModel.id,
                    "name",
                    CategoryModel.name,
                    "order",
                    CategoryModel.order,
                    "sub_categorys",
                    func.coalesce(
                        subquery.c.sub_categorys,
                        func.cast(literal([]), type_=types.JSON),
                    ),
                ).order_by(asc(CategoryModel.order))
            )
        )
        .select_from(CategoryModel)
        .outerjoin(subquery, subquery.c.category_id == CategoryModel.id)
        .where(CategoryModel.nav_id == nav_id)
    )

    result = db.execute(stmt).scalar_one()
    return result or []
