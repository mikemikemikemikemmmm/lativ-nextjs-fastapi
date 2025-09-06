import { CategoryRead } from "@/types"
import Link from "next/link"
export const CategoryAside = (props: { categorys: CategoryRead[], navRoute: string }) => {
return <aside className="ml-6">
        {
            props.categorys.map(c => <ul className="mb-4" key={c.id}>
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