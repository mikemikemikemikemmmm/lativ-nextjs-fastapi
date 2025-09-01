import { SizeRead } from "./size"

export interface ProductModal_SubProductRead {
    id: number
    price: number
    img_file_name: string
    color_id: number
    color_name: string
    color_img_url: string
    size_ids: number[]
}