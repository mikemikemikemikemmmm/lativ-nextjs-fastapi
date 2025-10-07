'use client'
import { getApi } from "@/api/base"
import { ProductCard } from "@/components/productCard"
import type { NavRead, ProductCardRead } from "@/types"
import { getImgUrl } from "@/utils/env"
import { Image } from "@/components/image";
import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router"

export const NavIndexLoader = async ({ params }: LoaderFunctionArgs) => {
    const { nav_route } = params
    const getNav = getApi<NavRead>(`navs/${nav_route}`)
    const getCards = getApi<ProductCardRead[]>(`products/nav_index?nav_route=${nav_route}`)
    const asyncFn = [getNav, getCards]
    const [nav, cards] = await Promise.all(asyncFn)
    if (nav.error || cards.error) {
        throw redirect("/404")
    }
    const targetNav = nav.data
    const targetCards = cards.data
    return {
        nav: targetNav,
        cards: targetCards
    }
}

export function NavIndexPage() {
    console.log("nav")
    const { nav, cards } = useLoaderData<{ nav: NavRead, cards: ProductCardRead[] }>();
    return <section className="w-full">
        <div className="w-full mb-10">
            <Image height={400} width={1010} src={getImgUrl(nav.img_file_name)} alt={nav.name} /></div>
        <div className="grid grid-cols-4 gap-8">
            {
                cards.map(pc => <div key={pc.id}>
                    <ProductCard pc={pc} />
                </div>)
            }
        </div>
    </section >
}
export default NavIndexPage