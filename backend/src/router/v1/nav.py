from fastapi import APIRouter
from src.db import SessionDepend
from src.models.nav import CreateSchema, NavModel, UpdateSchema
from src.service.crud import CRUD

nav_router = APIRouter()

@nav_router.get("/")
def get_all(db: SessionDepend):
    return CRUD.get_all(db, NavModel)

@nav_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return CRUD.create_one(db, NavModel, create_data)

@nav_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return CRUD.update_one_by_id(db, NavModel, update_data, id)

@nav_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return CRUD.delete_one_by_id(db, NavModel, id)