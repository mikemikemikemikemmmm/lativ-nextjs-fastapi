export interface GenderCreateDto{
    name:string
}
export interface GenderUpdateDto extends GenderCreateDto{}
export interface GenderResponse extends GenderCreateDto {
    id: number
}