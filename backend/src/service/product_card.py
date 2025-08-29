from sqlalchemy.orm import selectinload
from sqlalchemy import select
from src.models.product import ProductModel
from src.models.subProduct import SubProductModel
from src.models.series import SeriesModel
from src.models.subCategory import SubCategoryModel
from src.models.category import CategoryModel
from src.db import SessionDepend
from src.dto.product_card import ProductCard, ProductCardSubProduct


from typing import Sequence

# 共用函式：生成 ProductCard
def build_product_cards(products: Sequence[ProductModel], include_sub_products: bool = False) -> Sequence[ProductCard]:
    product_cards: Sequence[ProductCard] = []
    for product in products:
        if not product.sub_products:
            continue

        first_sub = sorted(product.sub_products, key=lambda sp: sp.order)[0]

        product_card = ProductCard(
            id=product.id,
            img_url=first_sub.color.img_url,
            name=product.name,
            gender_name=product.gender.name,
            sub_products=[
                ProductCardSubProduct(
                    id=sp.id,
                    color_img_url=sp.color.img_url,
                    color_name=sp.color.name
                )
                for sp in sorted(product.sub_products, key=lambda sp: sp.order)
            ] if include_sub_products else [],
            price=first_sub.price,
        )
        product_cards.append(product_card)
    return product_cards


# 根據 color_id 查詢
def get_product_cards_by_color_id(db: SessionDepend, color_id: int) -> Sequence[ProductCard]:
    stmt = (
        select(ProductModel)
        .options(
            selectinload(ProductModel.sub_products).selectinload(SubProductModel.color),
            selectinload(ProductModel.gender),
        )
        .join(ProductModel.sub_products)
        .where(SubProductModel.color_id == color_id)
    )
    products = db.execute(stmt).scalars().all()
    return build_product_cards(products, include_sub_products=False)


# 根據 sub_category_id 查詢
def get_product_cards_by_sub_category_id(db: SessionDepend, sub_category_id: int) -> Sequence[ProductCard]:
    stmt = (
        select(ProductModel)
        .join(ProductModel.series)
        .join(ProductModel.sub_products)
        .where(SeriesModel.sub_category_id == sub_category_id)
        .options(
            selectinload(ProductModel.sub_products).selectinload(SubProductModel.color),
            selectinload(ProductModel.gender),
            selectinload(ProductModel.series).selectinload(SeriesModel.sub_category),
        )
    )
    products = db.execute(stmt).scalars().all()
    return build_product_cards(products, include_sub_products=True)


# 根據 nav_id 查詢
def get_product_cards_by_nav_id(db: SessionDepend, nav_id: int) -> Sequence[ProductCard]:
    stmt = (
        select(ProductModel)
        .options(
            selectinload(ProductModel.sub_products).selectinload(SubProductModel.color),
            selectinload(ProductModel.gender),
            selectinload(ProductModel.series)
            .selectinload(SeriesModel.sub_category)
            .selectinload(SubCategoryModel.category)
            .selectinload(CategoryModel.nav),
        )
        .join(ProductModel.series)
        .join(SeriesModel.sub_category)
        .join(SubCategoryModel.category)
        .where(CategoryModel.nav_id == nav_id)
    )
    products = db.execute(stmt).scalars().all()
    return build_product_cards(products, include_sub_products=True)