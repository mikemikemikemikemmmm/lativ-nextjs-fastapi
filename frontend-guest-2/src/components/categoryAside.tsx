import { getApi } from "@/api/base";
import type { CategoryRead } from "@/types"
import { redirectTo404 } from "@/utils/errorHandler";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router"
export const CategoryAside = () => {
    const { nav_route, product_id } = useParams();
    const [c, setC] = useState<CategoryRead[] | "loading">("loading")
    useEffect(() => {
        const get = async () => {
            if (!nav_route && !product_id) {
                return redirectTo404()
            }
            const getApiUrl = nav_route ? `categorys?nav_route=${nav_route}` : `categorys?product_id=${product_id}`
            const { data, error } = await getApi<CategoryRead[]>(getApiUrl)
            if (error) {
                return redirectTo404()
            }
            setC(data)
        }
        get()
    }, [nav_route, product_id])
    if (c === "loading") {
        return null
    }
    if (c.length === 0) {
        return redirectTo404()
    }
    return <aside className="ml-6  px-2">
        {
            c.map(c => <ul className="mb-4" key={c.id}>
                <li className="my-1 text-[16px]">◆ {c.name}</li>
                {
                    c.sub_categorys.map(sc => <li className="my-1  text-[14px]" key={sc.id}>
                        <Link to={`/category/${c.nav_route}/${c.route}/${sc.route}`}>{`> ${sc.name}`}</Link>
                    </li>)
                }
            </ul>)
        }
    </aside>
}