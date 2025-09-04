import { getApi } from '@/api/base';
import { CategoryAside } from '@/components/categoryAside';
import { ASIDE_WIDTH } from '@/style/cssConst';
import { AsideRead } from '@/types/aside';

export default async function Layout({
    children, params
}: {
    children: React.ReactNode, params: { nav_route: string }
}) {
    const { nav_route } = await params
    const { data, error } = await getApi<AsideRead[]>(`categorys?nav_route=${nav_route}`)
    if (error) {
        return null
    }
    return <section className='flex'>
        <div style={{ width: ASIDE_WIDTH }}>
            <CategoryAside categorys={data} navRoute={nav_route} />
        </div>
        <div className="">{children}</div>

    </section>
}