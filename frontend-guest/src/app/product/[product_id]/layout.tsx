import { getApi } from '@/api/base';
import { CategoryAside } from '@/components/categoryAside';
import { ASIDE_WIDTH, WIDTH } from '@/style/cssConst';
import { CategoryRead } from '@/types';

export default async function Layout({
    children, params
}: {
    children: React.ReactNode, params: { product_id: string }
}) {
    const { product_id } = await params
    const { data, error } = await getApi<CategoryRead[]>(`categorys?product_id=${product_id}`)
    if (error) {
        return null
    }
    
    return <section className='flex'>
        <div style={{ width: ASIDE_WIDTH }}>
            <CategoryAside categorys={data} navRoute={data[0].nav_route} />
        </div>
        <div className='flex-1'>{children}</div>

    </section>
}