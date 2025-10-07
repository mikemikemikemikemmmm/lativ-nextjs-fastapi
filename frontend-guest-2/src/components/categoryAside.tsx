import type { CategoryRead } from "@/types"
import { Link } from "react-router"
export const CategoryAside = (props: { categorys: CategoryRead[] }) => {
    const {categorys}= props
    return <aside className="ml-6  px-2">
        {
            categorys.map(c => <ul className="mb-4" key={c.id}>
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