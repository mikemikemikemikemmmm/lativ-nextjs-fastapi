from fastapi import APIRouter
from sqlalchemy import text
from src.db import SessionDepend
from src.models.category import CategoryModel, CreateSchema, UpdateSchema
from src.models.subCategory import SubCategoryModel
from src.models.nav import NavModel
from src.service.common import common_service
from src.errorHandler._global import ErrorHandler

category_router = APIRouter()


@category_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return common_service.create_one(db, CategoryModel, create_data)


@category_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return common_service.delete_one_by_id(db, CategoryModel, id)


@category_router.put("/switch_order/{id1}/{id2}")
def switch_order(db: SessionDepend, id1: int, id2: int):
    return common_service.switch_order(db, CategoryModel, id1, id2)


@category_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return common_service.update_one_by_id(db, CategoryModel, update_data, id)


@category_router.get("/nav_id/{nav_id}")
def get_category_and_sub_categorys_by_nav_id(db: SessionDepend, nav_id: int):
    return (
        db.query(CategoryModel)
        .filter(CategoryModel.nav_id == nav_id)
        .order_by(CategoryModel.order)
        .all()
    )
