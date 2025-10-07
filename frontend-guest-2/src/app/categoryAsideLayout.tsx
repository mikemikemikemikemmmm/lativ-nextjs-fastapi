import { CategoryAside } from '@/components/categoryAside';
import { ASIDE_WIDTH } from '@/style/cssConst';
import { Outlet } from 'react-router';
export default function CategoryAsideLayout() {
    return <section className='flex'>
        <div style={{ width: ASIDE_WIDTH }}>
            <CategoryAside />
        </div>
        <div className="flex-1 px-2">
            <Outlet />
        </div>
    </section>
}