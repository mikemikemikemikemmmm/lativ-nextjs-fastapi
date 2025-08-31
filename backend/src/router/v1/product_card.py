from fastapi import APIRouter
from src.db import SessionDepend
from src.service.product_card import (
    get_product_cards_by_color_id,
    get_product_cards_by_nav_id,
    get_product_cards_by_sub_category_id,
)
from typing import Optional

product_card_router = APIRouter()


@product_card_router.get("/")
def get_product_cards(
    db: SessionDepend,
    color_id: Optional[int] = None,
    nav_id: Optional[int] = None,
    sub_category_id: Optional[int] = None,
):
    if color_id:
        return get_product_cards_by_color_id(db, color_id)
    if nav_id:
        return get_product_cards_by_nav_id(db, nav_id)
    if sub_category_id:
        return get_product_cards_by_sub_category_id(db, sub_category_id)
    else:
        return []