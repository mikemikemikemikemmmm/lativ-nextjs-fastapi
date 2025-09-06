import { getApi } from "@/api/base"
import { ProductCard } from "@/components/productCard"
import { NavRead, ProductCardRead } from "@/types"
import { getImgUrl } from "@/utils/env"
import { NEXT_CACHE_REVALIDATED_TAGS_HEADER } from "next/dist/lib/constants"

export default async ({ params }: { params: { nav_route: string } }) => {
    const { nav_route } = await params
    const getNav = await getApi<NavRead>(`navs/${nav_route}`)
    if (getNav.error) {
        return null
    }
    const nav = getNav.data
    const { data, error } = await getApi<ProductCardRead[]>(`products/nav_index?nav_route=${nav_route}`)
    if (error) {
        return null
    }
    return <section className="w-full">
        <div className="w-full mb-10">
            <img src={getImgUrl(nav.img_file_name)} alt={nav.name} /></div>
        <div className="grid grid-cols-4 gap-8">
            {
                data.map(pc => <div key={pc.id}>
                    <ProductCard pc={pc} />
                </div>)
            }
        </div>
    </section >
}