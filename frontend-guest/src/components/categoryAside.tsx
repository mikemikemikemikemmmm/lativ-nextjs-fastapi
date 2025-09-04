import { AsideRead } from "@/types/aside"
import Link from "next/link"
Link
export const CategoryAside = (props: { categorys: AsideRead[], navRoute: string }) => {
    return <aside>
        {
            props.categorys.map(c => <ul key={c.id}>
                <li>{c.name}</li>
                {
                    c.sub_categorys.map(sc => <li className="ml-3" key={sc.id}>
                        <Link href={`/category/${props.navRoute}}/${c.route}/${sc.route}`}>{c.name}</Link>
                    </li>)
                }
            </ul>)
        }
    </aside>
}