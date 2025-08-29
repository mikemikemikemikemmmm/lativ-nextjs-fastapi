export interface ProductCreate {
    name: string
    gender_id: number,
    img_url: string,
    series_id: number
}
export interface ProductUpdate extends ProductCreate { }

export interface ProductDetail {
    name: string
    id: number
    gender_name: string
    sub_category_id: number
    sub_products: SubProduct[]
}
export interface SubProduct {
    id: number
    price: number
    img_url: string
    color_id: number
    color_name: string
    color_img_url: string
    sizes: Size[]
}




export interface ProductCard {
    id: number
    img_url: string
    name: string
    gender_name: string
    sub_products: ProductCard_SubProduct[]
    price: number
}

export interface ProductCard_SubProduct {
    id: number
    color_img_url: string
    color_name: string
}

export interface Size {
    id: number
    name: string
    is_show: boolean
}