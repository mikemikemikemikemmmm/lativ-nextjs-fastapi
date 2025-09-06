import { ASIDE_WIDTH } from "@/style/cssConst"
import { NavRead } from "@/types"
import Link from "next/link"
Link
export const NavHeader = (props: { navs: NavRead[], navRoute?: string }) => {
    return <section className="my-4">
        <div className="text-right"></div>
        <div className="flex px-2">
            <Link className="inline-flex justify-center items-end text-center text-4xl font-extrabold text-nav-header-logo hover:cursor-pointer" href={"/"} style={{ width: ASIDE_WIDTH }}>
                lativ
            </Link>
            <div className="inline-flex flex-1 items-end">
                {
                    props.navs.map(n => <Link
                        key={n.id}
                        href={`/home/${n.route}`}
                        style={{ width: 100 }}
                        className={`${n.route === props.navRoute ? "bg-nav-header-item-bg text-nav-header-item-hover" : ""} text-center mx-4 text-nav-header-item hover:bg-nav-header-item-bg hover:text-nav-header-item-hover`}
                    >
                        {n.name}
                    </Link>)
                }
            </div>
        </div>
    </section>
}