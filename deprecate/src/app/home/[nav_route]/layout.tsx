'use client'
import { CategoryAside } from '@/components/categoryAside';
import { useGetData } from '@/hook/useGetData';
import { ASIDE_WIDTH } from '@/style/cssConst';
import { CategoryRead } from '@/types';
import { useParams } from 'next/navigation';
export default function Layout({
    children
}: {
    children: React.ReactNode,

}) {
    const { nav_route } = useParams()
    return <section className='flex'>
        <div style={{ width: ASIDE_WIDTH }}>
            <CategoryAside navRoute={nav_route as string} />
        </div>
        <div className="flex-1 px-2">{children}</div>

    </section>
}