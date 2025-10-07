

interface BaseRead {
    id: number,
    name: string,
    route: string
}
export interface NavRead extends BaseRead {
    img_file_name: string
}

export interface CategoryRead {
    id: number,
    nav_route: string,
    name: string,
    route: string
    sub_categorys: BaseRead[]
}

export interface SeriesRead {
    id: number,
    name: string,
    products: ProductCardRead[]
    sub_category_name: string
}

export interface ProductCardRead {
    id: number
    img_url: string
    name: string
    gender_name: string
    sub_products: ProductCardRead_SubProductRead[]
}

export interface ProductDetailRead extends Omit<ProductCardRead, "sub_products"> {
    sub_products: SubProductRead[]
}



interface ProductCardRead_SubProductRead {
    id: number,
    color_id: number,
    color_name: string,
    color_img_file_name: string
    img_file_name:string
    price: number
}
export interface SubProductRead extends ProductCardRead_SubProductRead {
    sizes: SizeRead[]
}
export interface SizeRead { id: number, name: string }
