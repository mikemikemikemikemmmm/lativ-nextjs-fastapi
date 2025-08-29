export interface NavBaseCreateDto {
    name: string
    route: string
}
export interface NavBaseUpdateDto { }

export interface CategoryCreateDto extends NavBaseCreateDto {
    nav_id: number
}
export interface CategoryUpdateDto extends CategoryCreateDto { }

export interface SubCategoryCreateDto extends NavBaseCreateDto {
    category_id: number
}
export interface SubCategoryUpdateDto extends SubCategoryCreateDto { }


export interface NavResponse {
    id: string,
    name: string,
    route: string,
    categorys: CategoryResponse[]
}
export interface CategoryResponse {
    nav_id: string
    id: string,
    name: string,
    route: string,
    sub_categorys: {
        nav_route: string
        category_route: string
        id: string,
        name: string,
        route: string,
    }[]
}
