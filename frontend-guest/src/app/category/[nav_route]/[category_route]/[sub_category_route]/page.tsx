'use client'
import { ProductCard } from "@/components/productCard"
import { useGetData } from "@/hook/useGetData"
import { SeriesRead } from "@/types"
import { useParams } from "next/navigation"

function SubCategoryPage() {
    const { nav_route, category_route, sub_category_route } = useParams()
    const [_, series] = useGetData<SeriesRead>(`series?nav_route=${nav_route}&category_route=${category_route}&sub_category_route=${sub_category_route}`)

    if (series === "loading") {
        return null
    }
    if (series.length <= 0) {
        return <div>無資料</div>
    }
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