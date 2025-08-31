export interface GenderCreateDto{
    name:string
}
export interface GenderUpdateDto extends GenderCreateDto{}
export interface GenderRead extends GenderCreateDto {
    id: number
}