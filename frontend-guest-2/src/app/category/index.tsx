'use client'
import { getApi } from "@/api/base"
import { ProductCard } from "@/components/productCard"
import type { SeriesRead } from "@/types"
import { redirectTo404 } from "@/utils/errorHandler"
import { useLoaderData } from "react-router"

export const SubCategoryLoader = async (p: { params: { nav_route: string, category_route: string, sub_category_route: string } }) => {
    const { nav_route, category_route, sub_category_route } = p.params
    if (!nav_route || !category_route || !sub_category_route) {
        return redirectTo404()
    }
    const { data, error } = await getApi<SeriesRead[]>(`series?nav_route=${nav_route}&category_route=${category_route}&sub_category_route=${sub_category_route}`)
    if (error || data.length === 0) {
        return redirectTo404()
    }
    return { series: data }

}

export function SubCategoryPage() {
    const { series } = useLoaderData<{ series: SeriesRead[] }>();
    return <div>
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
}
export default SubCategoryPage