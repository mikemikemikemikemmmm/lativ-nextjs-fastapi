from src.db import SessionDepend
from src.models.nav import NavModel
from src.models.category import CategoryModel
from sqlalchemy.orm import selectinload


def get_all_navs(db: SessionDepend):
    navs =db.query(NavModel).options(
        selectinload(NavModel.categorys).selectinload(CategoryModel.sub_categorys)
    ).all()
    print(navs)
    return navs