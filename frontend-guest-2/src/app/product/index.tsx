import { getApi } from "@/api/base"
import type { ProductDetailRead, SizeRead, SubProductRead } from "@/types"
import { useLoaderData, redirect, useLocation, type LoaderFunctionArgs } from "react-router"
import { useEffect, useState } from "react"
import { getImgUrl } from "@/utils/env"
import * as ImageComponent from "@/components/image"
export const ProductPageLoader = async ({ params }: LoaderFunctionArgs) => {
    const { product_id } = params
    const { data, error } = await getApi<ProductDetailRead[]>(`products?product_id=${product_id}`)
    if (error) {
        throw redirect("/404")
    }
    return { detail: data[0] }
}
export function ProductPage() {
    const { detail } = useLoaderData<{ detail: ProductDetailRead }>();
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search); // 將 query string 解析成 URLSearchParams
    const sub_product_id = queryParams.get('sub_product_id')
    const [subproduct, setSubproduct] = useState<SubProductRead>(() => {
        if (sub_product_id) {
            const targetSp = detail.sub_products.find(sp => sp.id === Number(sub_product_id))
            if (targetSp) {
                return targetSp
            }
        }
        return detail.sub_products[0]

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
            const promises = detail.sub_products.map(sp => {
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
                <ImageComponent.Image width={500} height={500} src={getImgUrl(subproduct.img_file_name)} alt={detail.name} />
            </div>
            <div className="flex-1">
                <div>
                    {detail.name}-{detail.gender_name}（{subproduct.color_name}－{size?.name || ""}）
                </div>
                <div>
                    NT${subproduct.price}
                </div>
                <hr className="my-7" />
                <div className="mb-3">
                    {
                        detail.sub_products.map(sp => <div onClick={() => handleColor(sp)} className={`${sp.id === subproduct.id ? "border-black" : "border-white"} border mr-2 hover:cursor-pointer inline-block`} key={sp.id}>
                            <ImageComponent.Image src={getImgUrl(sp.color_img_file_name)} alt={sp.color_name} width={24} height={24} />
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
export default ProductPage