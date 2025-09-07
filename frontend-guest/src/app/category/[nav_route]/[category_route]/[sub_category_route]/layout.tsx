import { getApi } from '@/api/base';
import { CategoryAside } from '@/components/categoryAside';
import { ASIDE_WIDTH } from '@/style/cssConst';
import { CategoryRead } from '@/types';

export default async function Layout({
    children, params
}: {
    children: React.ReactNode, params: { nav_route: string, category_route: string, sub_category_route: string }
}) {
    const { nav_route } = await params
    const { data, error } = await getApi<CategoryRead[]>(`categorys?nav_route=${nav_route}`)
    if (error) {
        return null
    }
    return <section className='flex'>
        <div style={{ width: ASIDE_WIDTH }}>
            <CategoryAside categorys={data} navRoute={nav_route} />
        </div>
        <div className="flex-1 px-2">{children}</div>

    </section>
}