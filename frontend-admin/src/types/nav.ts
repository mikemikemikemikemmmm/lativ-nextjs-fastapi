interface BaseRead {
    id: number,
    name: string,
    route: string
}
export interface NavRead extends BaseRead {
    categorys: CategoryRead[]
    img_file_name: string
}

export interface CategoryRead extends BaseRead {
    nav_id: number
}

export interface SubCategoryRead extends BaseRead {
    category_id: number
}