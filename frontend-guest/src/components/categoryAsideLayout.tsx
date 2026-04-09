import { CategoryAside } from '@/components/categoryAside';
import { ASIDE_WIDTH } from '@/style/cssConst';
import type { CategoryRead } from '@/types';
import { type JSX } from 'react';

export default function CategoryAsideLayout(props: { children: JSX.Element, categorys: CategoryRead[] }) {
    return <section className='flex'>
        <div style={{ width: ASIDE_WIDTH }}>
            <CategoryAside categorys={props.categorys} />
        </div>
        <div className="flex-1 px-2">
            {props.children}
        </div>
    </section>
}