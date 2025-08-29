import { ProductCard } from "./product"

export interface SeriesCreateDto {
    sub_category_id: number
    name: string
}
export interface SeriesUpdateDto extends SeriesCreateDto { }
export interface SeriesResponse {
    id: number
    name: string
    product_cards: ProductCard[]
}