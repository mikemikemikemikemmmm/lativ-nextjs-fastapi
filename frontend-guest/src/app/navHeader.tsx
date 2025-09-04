import { ASIDE_WIDTH } from "@/style/cssConst"
import { NavRead } from "@/types/nav"
import Link from "next/link"
Link
export const NavHeader = (props: { navs: NavRead[] }) => {
    return <section className="my-4">
        <div className="text-right"></div>
        <div className="flex">
            <Link className="inline-flex justify-center items-end text-center text-4xl font-extrabold text-nav-header-logo hover:cursor-pointer" href={"/"} style={{ width: ASIDE_WIDTH }}>
                lativ
            </Link>
            <div className="inline-flex flex-1 items-end">
                {
                    props.navs.map(n => <Link
                        key={n.id}
                        href={`/home/${n.route}`}
                        className="px-4 mx-4 text-nav-header-item hover:bg-nav-header-item-bg hover:text-nav-header-item-hover"
                    >
                        {n.name}
                    </Link>)
                }
            </div>
        </div>
    </section>
}