from fastapi import APIRouter
from src.db import SessionDepend
from src.models.subCategory import CreateSchema, SubCategoryModel, UpdateSchema
from src.service.crud import CRUD

sub_category_router = APIRouter()

@sub_category_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return CRUD.create_one(db, SubCategoryModel, create_data)

@sub_category_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return CRUD.update_one_by_id(db, SubCategoryModel, update_data, id)

@sub_category_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return CRUD.delete_one_by_id(db, SubCategoryModel, id)