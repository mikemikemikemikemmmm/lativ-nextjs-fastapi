from typing import List
from pydantic import BaseModel

class ProductCardSubProduct(BaseModel):
    id: int
    color_img_url: str
    color_name: str

class ProductCard(BaseModel):
    id: int
    img_url: str
    name: str
    gender_name: str
    sub_products: List[ProductCardSubProduct]
    price: int