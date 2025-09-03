'use client'
import * as React from 'react';
import { ProductCardRead } from '@/types/product';
import Autocomplete from './_components/autoComplete';
import { getApi } from '@/api/base';
import { errorHandler } from '@/utils/errorHandler';
import { useRouter } from 'next/navigation';
const MAX_SHOW = 5
export default function ProductIdLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // const products: ProductCardRead[] = [
    const router= useRouter()
    const handleSelect = (product:ProductCardRead) => {
        console.log("aaa")
        router.push(`/product/${product.id}`)
     }
    const handleFetch = async (queryStr: string) => {
        // await sleep(2000);
        const { data, error } = await getApi<ProductCardRead[]>(`product_card/?product_name=${queryStr}`)
        if (error) {
            errorHandler(error)
            return []
        }
        return data.slice(0, MAX_SHOW)
    }
    return (
        <div className='py-4'>
            <div className='text-center'>
                <div className="inline-block mr-2">
                    以產品名稱搜尋
                </div>
                <Autocomplete onSelect={(item:ProductCardRead)=>handleSelect(item)} fetchData={query => handleFetch(query)} />
            </div>

            {children}
        </div>
    );
}