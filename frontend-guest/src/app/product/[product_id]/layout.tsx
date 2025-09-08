'use client'
import { CategoryAside } from '@/components/categoryAside';
import { NotFoundUI } from '@/components/notFound';
import { useGetData } from '@/hook/useGetData';
import { ASIDE_WIDTH } from '@/style/cssConst';
import { CategoryRead } from '@/types';
import { useParams } from 'next/navigation';
export default function Layout({
    children
}: {
    children: React.ReactNode
}) {
    const { product_id } = useParams()
    const [_, categorys] = useGetData<CategoryRead>(`categorys?product_id=${product_id}`)
    if (categorys === "loading") {
        return null
    }
    if(categorys.length === 0){
        return <NotFoundUI/>
    }
    return <section className='flex'>
        <div style={{ width: ASIDE_WIDTH }}>
            <CategoryAside categorys={categorys} navRoute={categorys[0].nav_route} />
        </div>
        <div className='flex-1'>{children}</div>

    </section>
}