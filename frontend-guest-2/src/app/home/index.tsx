import { getApi } from "@/api/base"
import { ProductCard } from "@/components/productCard"
import type { CategoryRead, NavRead, ProductCardRead } from "@/types"
import { getImgUrl } from "@/utils/env"
import { Image } from "@/components/image";
import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router"
import CategoryAsideLayout from "@/components/categoryAsideLayout";

export const NavIndexLoader = async ({ params }: LoaderFunctionArgs) => {
    const { nav_route } = params
    const getNav = getApi<NavRead>(`navs/${nav_route}`)
    const getCards = getApi<ProductCardRead[]>(`products/nav_index?nav_route=${nav_route}`)
    const getCategorys = getApi<CategoryRead[]>(`categorys?nav_route=${nav_route}`)

    const asyncFn = [getNav, getCards, getCategorys]
    const [nav, cards, categorys] = await Promise.all(asyncFn)
    if (nav.error || cards.error || categorys.error) {
        throw redirect("/404")
    }
    const targetNav = nav.data
    const targetCards = cards.data
    return {
        nav: targetNav,
        cards: targetCards,
        categorys: categorys.data
    }
}

export function NavIndexPage() {
    const { nav, cards, categorys } = useLoaderData<{ nav: NavRead, cards: ProductCardRead[], categorys: CategoryRead[] }>();
    return <CategoryAsideLayout categorys={categorys}>
        <section className="w-full">
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
    </CategoryAsideLayout>
}
export default NavIndexPage