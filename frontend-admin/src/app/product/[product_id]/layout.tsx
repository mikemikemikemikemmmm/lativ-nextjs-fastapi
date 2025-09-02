'use client'
import * as React from 'react';
import { ProductCardRead } from '@/types/product';
import Autocomplete from './autoComplete';
import { getApi } from '@/api/base';
import { errorHandler } from '@/utils/errorHandler';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ProductIdLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // const [products, setProducts] = React.useState<ProductCardRead[]>([{

    const products: ProductCardRead[] = [
        {
            id: 1,
            img_url: "https://example.com/img1.jpg",
            name: "經典白T",
            gender_name: "男",
            gender_id: 1,
            sub_product_count: 3,
            series_id: 101
        },
        {
            id: 2,
            img_url: "https://example.com/img2.jpg",
            name: "休閒牛仔褲",
            gender_name: "女",
            gender_id: 2,
            sub_product_count: 2,
            series_id: 102
        },
        {
            id: 3,
            img_url: "https://example.com/img3.jpg",
            name: "運動鞋",
            gender_name: "中性",
            gender_id: 3,
            sub_product_count: 4,
            series_id: 103
        },
        {
            id: 4,
            img_url: "https://example.com/img4.jpg",
            name: "連帽外套",
            gender_name: "男",
            gender_id: 1,
            sub_product_count: 5,
            series_id: 104
        },
        {
            id: 5,
            img_url: "https://example.com/img5.jpg",
            name: "夏日洋裝",
            gender_name: "女",
            gender_id: 2,
            sub_product_count: 6,
            series_id: 105
        }
    ];
    const handleSelect = (a: { name?: string }) => { }
    const handleFetch = async (queryStr: string) => {
        await sleep(2000);
        // const {data,error} = await getApi(`product/cards/?product_name_include=${queryStr}`)
        // if(error){
        //     errorHandler(error)
        //     return []
        // }
        return []
    }
    return (
        <div className='py-4'>
            <div className='text-center'>
                <div className="inline-block mr-2">
                    以產品名稱搜尋
                </div>
                <Autocomplete onSelect={handleSelect} fetchData={handleFetch} />
            </div>

            {children}
        </div>
    );
}