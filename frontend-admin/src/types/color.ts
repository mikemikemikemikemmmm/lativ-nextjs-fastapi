export interface ColorCreate {
    name: string
    img_url: string
}
export interface ColorUpdate extends ColorCreate { }
export interface ColorRead extends ColorCreate {
    id: number
}