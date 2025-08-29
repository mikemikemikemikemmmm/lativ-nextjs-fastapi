export interface SubProductCreate {
    price: number
    color_id: number,
    size_ids: number[],
    img_url: string
}
export interface SubProductUpdate extends SubProductCreate {

}