import { ProductModal_SubProductRead } from "./subProduct"

export interface ProductModalRead {
    name: string
    id: number
    gender_name: string
    gender_id: number
    series_id: number
    sub_product_ids: number[]
}



export interface ProductCardRead {
    id: number
    img_url: string
    name: string
    gender_name: string
    price: number
    sub_products: {
        id: number
        color_img_url: string
        color_name: string
    }[]
}
