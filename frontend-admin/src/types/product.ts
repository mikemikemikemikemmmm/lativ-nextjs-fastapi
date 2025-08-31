import { SizeRead } from "./size"
import { ProductModal_SubProductRead } from "./subProduct"

export interface ProductModalRead {
    name: string
    id: number
    gender_name: string
    gender_id: number
    series_id: number
    img_url: string
    sub_product_ids: number[]
}



export interface ProductCardRead {
    id: number
    img_url: string
    name: string
    gender_name: string
    gender_id: number
    sub_product_count: number
    series_id: number
}