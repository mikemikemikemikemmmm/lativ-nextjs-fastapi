from fastapi import APIRouter
from .nav import nav_router
from .category import category_router
from .sub_category import sub_category_router
from .product import product_router
from .series import series_router
from .size import size_router
from .gender import gender_router
from .color import color_router
from .sub_product import sub_product_router
from .product_card import product_card_router
v1_router = APIRouter()
v1_router.include_router(nav_router,prefix="/nav")
v1_router.include_router(category_router,prefix="/category")
v1_router.include_router(sub_category_router,prefix="/sub_category")
v1_router.include_router(product_router,prefix="/product")
v1_router.include_router(series_router,prefix="/series")
v1_router.include_router(size_router,prefix="/size")
v1_router.include_router(gender_router,prefix="/gender")
v1_router.include_router(color_router,prefix="/color")
v1_router.include_router(sub_product_router,prefix="/sub_product")
v1_router.include_router(product_card_router,prefix="/product_card")