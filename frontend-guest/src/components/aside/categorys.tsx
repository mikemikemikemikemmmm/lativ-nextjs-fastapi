import { CategoryResponse } from "@/types/nav";
import Link from "next/link";
export const CategoryAside = (props: { categorys: CategoryResponse[] }) => {
    const { categorys } = props
    return <aside>
        {
            categorys.map(c => <ul key={c.id}>
                <li>
                    。{c.name}
                </li>
                {
                    c.sub_categorys.map(sc => <li key={sc.id}>
                        <Link href={`${sc.nav_route}/${sc.category_route}/${sc.route}`}>{"> " + sc.name}</Link>
                    </li>)
                }
            </ul>)
        }
    </aside>
}