from fastapi import APIRouter
from src.db import SessionDepend
from src.models.gender import CreateSchema, GenderModel, UpdateSchema
from src.service.crud import CRUD

gender_router = APIRouter()

@gender_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return CRUD.create_one(db, GenderModel, create_data)

@gender_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return CRUD.update_one_by_id(db, GenderModel, update_data, id)

@gender_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return CRUD.delete_one_by_id(db, GenderModel, id)