import { useGetData } from "@/hook/useGetData"
import { CategoryRead } from "@/types"
import Link from "next/link"
export const CategoryAside = (props: { navRoute?: string, productId?: string }) => {
    const { navRoute, productId } = props
    if (!navRoute && !productId) {
        return null
    }
    const getApiUrl = navRoute ? `categorys?nav_route=${navRoute}` : `categorys?product_id=${productId}`
    const [_, categorys] = useGetData<CategoryRead>(getApiUrl)
    if (categorys === 'loading') {
        return null
    }
    return <aside className="ml-6  px-2">
        {
            categorys.map(c => <ul className="mb-4" key={c.id}>
                <li className="my-1 text-[16px]">◆ {c.name}</li>
                {
                    c.sub_categorys.map(sc => <li className="my-1  text-[14px]" key={sc.id}>
                        <Link href={`/category/${props.navRoute}/${c.route}/${sc.route}`}>{`> ${sc.name}`}</Link>
                    </li>)
                }
            </ul>)
        }
    </aside>
}