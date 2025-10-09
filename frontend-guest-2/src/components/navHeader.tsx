import { getApi } from "@/api/base";
import { ASIDE_WIDTH } from "@/style/cssConst"
import type { NavRead } from "@/types"
import { getImgUrl } from "@/utils/env";
import { redirectTo404 } from "@/utils/errorHandler";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
export const NavHeader = () => {
    const [navs, setNavs] = useState<NavRead[]>([])
    useEffect(() => {
        const getN = async () => {
            const { data, error } = await getApi<NavRead[]>("navs")
            if (error) {
                return redirectTo404()
            }
            setNavs(data)
        }
        getN()
    }, []);
    useEffect(() => {
        if (navs.length === 0) {
            return
        }
        const promises = navs.map(n => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.src = getImgUrl(n.img_file_name);
                img.onload = () => resolve();
                img.onerror = () => resolve(); // 錯誤也算完成
            });
        });
        Promise.all(promises);
        console.log(1)
    }, [navs]);
    return <section className="my-4 h-[40px]">
        <>
            <div className="text-right"></div>
            <div className="flex px-2">
                <NavLink className="inline-flex justify-center items-end text-center text-4xl font-extrabold text-nav-header-logo hover:cursor-pointer"
                    to={"/"}
                    style={{ width: ASIDE_WIDTH }}>
                    lativ
                </NavLink>
                <div className="inline-flex flex-1 items-end">
                    {
                        navs.map(n => <NavLink
                            key={n.id}
                            to={`/home/${n.route}`}
                            style={{ width: 100 }}
                            className={` text-center mx-4 text-nav-header-item hover:bg-nav-header-item-bg hover:text-nav-header-item-hover`}
                        >
                            {n.name}
                        </NavLink>)
                    }
                </div>
            </div>
        </>
    </section>
}