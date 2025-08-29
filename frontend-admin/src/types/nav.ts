// export interface NavBaseCreateDto {
//     name: string
//     route: string
// }
// export interface NavBaseUpdateDto { }

// export interface CategoryCreateDto extends NavBaseCreateDto {
//     nav_id: number
// }
// export interface CategoryUpdateDto extends CategoryCreateDto { }

// export interface SubCategoryCreateDto extends NavBaseCreateDto {
//     category_id: number
// }
// export interface SubCategoryUpdateDto extends SubCategoryCreateDto { }

interface BaseInput {
    id: number,
    name: string,
    route: string
}
export interface NavInput extends BaseInput { }
export interface NavRead extends NavInput {
    categorys: CategoryRead[]
}

export interface CategoryInput extends BaseInput { }
export interface CategoryRead extends CategoryInput {
    sub_categorys: SubCategoryRead[]
}

export interface SubCategoryInput extends BaseInput { }
export interface SubCategoryRead extends SubCategoryInput { 
}