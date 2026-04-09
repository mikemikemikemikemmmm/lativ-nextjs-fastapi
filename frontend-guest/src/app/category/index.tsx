'use client'
import { getApi } from "@/api/base"
import CategoryAsideLayout from "@/components/categoryAsideLayout"
import { ProductCard } from "@/components/productCard"
import type { CategoryRead, SeriesRead } from "@/types"
import { redirectTo404 } from "@/utils/errorHandler"
import { useLoaderData } from "react-router"
import type { LoaderFunctionArgs } from "react-router";
export const SubCategoryLoader = async ({ params }: LoaderFunctionArgs) => {
    const { nav_route, category_route, sub_category_route } = params
    if (!nav_route || !category_route || !sub_category_route) {
        return redirectTo404()
    }
    const get = [
        getApi<CategoryRead[]>(`categorys?nav_route=${nav_route}`),
        getApi<SeriesRead[]>(`series?nav_route=${nav_route}&category_route=${category_route}&sub_category_route=${sub_category_route}`)
    ]
    const [category, series] = await Promise.all(get)
    if (category.error || series.error) {
        return redirectTo404()
    }
    return { series: series.data, categorys: category.data }
}

export function SubCategoryPage() {
    const { series,categorys } = useLoaderData<{ series: SeriesRead[], categorys: CategoryRead[] }>();
    return <CategoryAsideLayout categorys={categorys}>
        <div>
            <div className="text-[22px] my-6 font-extrabold">
                {series[0].sub_category_name}
            </div>
            {
                series.map(s => <div key={s.id}>
                    <div className="text-[16px] mb-6">
                        {s.name}
                    </div>
                    <div className="grid grid-cols-4 gap-8">
                        {
                            s.products.map(pc => <div key={pc.id}>
                                <ProductCard pc={pc} />
                            </div>)
                        }
                    </div>
                </div>)
            }
            <div>
                <div>
                    { }
                </div>
            </div>

        </div>
    </CategoryAsideLayout>
}
export default SubCategoryPage