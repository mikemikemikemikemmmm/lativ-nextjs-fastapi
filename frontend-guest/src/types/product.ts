
import { ProductCardRead_SubProductRead, SubProductRead } from "./subProduct"
export interface ProductCardRead {
    id: number
    img_url: string
    name: string
    gender_name: string
    gender_id: number
    sub_products: ProductCardRead_SubProductRead[]
    series_id: number
}

export interface ProductDetailRead extends ProductCardRead {
    sub_products: SubProductRead[]
}
