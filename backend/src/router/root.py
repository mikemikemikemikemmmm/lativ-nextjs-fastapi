from fastapi import APIRouter
from .v1.root import v1_root_router

root_router = APIRouter()
root_router.include_router(v1_root_router, prefix="/v1")