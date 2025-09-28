from fastapi import APIRouter
from .admin.root import admin_router
from .guest.root import guest_router
v1_root_router = APIRouter()
v1_root_router.include_router(guest_router,prefix="/guest")
v1_root_router.include_router(admin_router,prefix="/admin")
