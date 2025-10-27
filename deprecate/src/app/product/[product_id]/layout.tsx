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
    return <section className='flex'>
        <div style={{ width: ASIDE_WIDTH }}>
            <CategoryAside productId={product_id as string} />
        </div>
        <div className='flex-1'>{children}</div>

    </section>
}