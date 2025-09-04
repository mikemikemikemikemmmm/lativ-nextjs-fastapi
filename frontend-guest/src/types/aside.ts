import { CategoryRead, SubCategoryRead } from "./nav";

export interface AsideRead {
    id:number,
    nav_route:string,
    name:string,
    route:string
    sub_categorys: SubCategoryRead[]
}