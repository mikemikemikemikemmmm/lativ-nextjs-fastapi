import { NavResponse } from "@/types/nav";
import { getApi } from "./base";
import { SeriesResponse } from "@/types/series";
import { ProductCard, ProductDetail } from "@/types/product";

export const getAllNavsApi = () => getApi<NavResponse[]>("navs")
export const getSeriesBySubCategoryIdApi = (subCategoryId: number) => getApi<SeriesResponse[]>(`series/?sub_category_id=${subCategoryId}`)
export const getProductDetailApi = (productId: number) => getApi<ProductDetail>(`product/${productId}`)
export const getProductCardsByNavIdApi = (navId: number) => getApi<ProductCard[]>(`product/?nav_id=${navId}`)