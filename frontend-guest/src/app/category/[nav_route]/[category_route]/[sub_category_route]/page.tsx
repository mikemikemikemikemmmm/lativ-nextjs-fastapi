import { getApi } from "@/api/base"
import { ProductCard } from "@/components/productCard"
import { SeriesRead } from "@/types"

export default async ({ params }: { params: { nav_route: string, category_route: string, sub_category_route: string } }) => {
    const { nav_route, category_route, sub_category_route } = await params
    const { data, error } = await getApi<SeriesRead[]>(`series?nav_route=${nav_route}&category_route=${category_route}&sub_category_route=${sub_category_route}`)
    if (error) {
        return null
    }
    if (data.length <= 0) {
        return <div>無資料</div>
    }
    return <div>
        <div className="text-[22px] my-6 font-extrabold">
            {data[0].sub_category_name}
        </div>
        {
            data.map(s => <div key={s.id}>
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