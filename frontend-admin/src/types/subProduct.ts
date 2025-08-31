import { SizeRead } from "./size"

export interface ProductModal_SubProductRead {
    id: number
    price: number
    img_url: string
    color_id: number
    color_name: string
    color_img_url: string
    sizes: SizeRead[]
}