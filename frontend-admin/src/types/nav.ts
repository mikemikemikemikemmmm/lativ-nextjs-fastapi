interface BaseRead {
    id: number,
    name: string,
    route: string
}
export interface NavRead extends BaseRead {
    categorys: CategoryRead[]
}

export interface CategoryRead extends BaseRead {
    nav_id:number
    // sub_categorys: SubCategoryRead[]
}

export interface SubCategoryRead extends BaseRead { 
    category_id:number
}