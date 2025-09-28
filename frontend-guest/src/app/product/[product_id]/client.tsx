'use client'
import { ProductDetailRead, SizeRead, SubProductRead } from "@/types";
import { getImgUrl } from "@/utils/env";
import * as NextImage from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
export const ProductClient = (props: { product: ProductDetailRead }) => {
    const { product } = props
    const searchParams = useSearchParams()
    const sub_product_id = searchParams.get('sub_product_id')
    const [subproduct, setSubproduct] = useState<SubProductRead>(() => {
        if (sub_product_id) {
            const targetSp = product.sub_products.find(sp => sp.id === Number(sub_product_id))
            if (targetSp) {
                return targetSp
            }
        }
        return product.sub_products[0]

    })
    const [size, setSize] = useState<SizeRead>(() => {
        return subproduct.sizes[0] || null
    })
    const handleColor = (c: SubProductRead) => {
        setSubproduct(c)
    }
    const handleSize = (s: SizeRead) => {
        setSize(s)
    }
    useEffect(() => {
        const preloadImages = async () => {
            const promises = product.sub_products.map(sp => {
                return new Promise<void>((resolve) => {
                    const img = new Image();
                    img.src = getImgUrl(sp.img_file_name);
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // 錯誤也算完成
                });
            });
            await Promise.all(promises);
        }
        preloadImages()
    }, []);
    return <div>
        <div className="flex">
            <div>
                <NextImage.default priority width={500} height={500} src={getImgUrl(subproduct.img_file_name)} alt={product.name} />
            </div>
            <div className="flex-1">
                <div>
                    {product.name}-{product.gender_name}（{subproduct.color_name}－{size?.name || ""}）
                </div>
                <div>
                    NT${subproduct.price}
                </div>
                <hr className="my-7" />
                <div className="mb-3">
                    {
                        product.sub_products.map(sp => <div onClick={() => handleColor(sp)} className={`${sp.id === subproduct.id ? "border-black" : "border-white"} border mr-2 hover:cursor-pointer inline-block`} key={sp.id}>
                            <NextImage.default priority src={getImgUrl(sp.color_img_file_name)} alt={sp.color_name} width={24} height={24} />
                        </div>)
                    }
                </div>
                <div>
                    {
                        subproduct.sizes.map(s => <div onClick={() => handleSize(s)} className={`${size?.id === s.id ? "border-black" : "border-white"} hover:cursor-pointer border  bg-[#EEEEEE] w-[60px] h-[30px] inline-flex items-center justify-center mr-2`} key={s.id}>
                            {s.name}
                        </div>)
                    }
                </div>
            </div>
        </div>
    </div>
}