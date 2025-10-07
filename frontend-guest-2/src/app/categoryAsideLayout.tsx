import { getApi } from '@/api/base';
import { CategoryAside } from '@/components/categoryAside';
import { ASIDE_WIDTH } from '@/style/cssConst';
import type { CategoryRead } from '@/types';
import { redirectTo404 } from '@/utils/errorHandler';
import { useLayoutEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router';
export default function CategoryAsideLayout() {
    const { nav_route, product_id } = useParams();
    const [c, setC] = useState<CategoryRead[] | "loading">("loading")
    useLayoutEffect(() => {
        setC("loading")
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
    return <section className='flex'>
        <div style={{ width: ASIDE_WIDTH }}>
            <CategoryAside categorys={c} />
        </div>
        <div className="flex-1 px-2">
            <Outlet />
        </div>
    </section>
}