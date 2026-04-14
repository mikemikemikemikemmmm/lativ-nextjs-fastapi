import { getApi } from "@/api/base"
import type { CategoryRead, ProductDetailRead, SizeRead, SubProductRead } from "@/types"
import { useLoaderData, redirect, useLocation, type LoaderFunctionArgs } from "react-router"
import { useEffect, useState } from "react"
import { getImgUrl } from "@/utils/env"
import * as ImageComponent from "@/components/image"
import CategoryAsideLayout from "@/components/categoryAsideLayout"

export const ProductPageLoader = async ({ params }: LoaderFunctionArgs) => {
    const { product_id } = params
    const get = [
        getApi<ProductDetailRead[]>(`products?product_id=${product_id}`),
        getApi<CategoryRead[]>(`categorys?product_id=${product_id}`),
    ]
    const [p, c] = await Promise.all(get)
    if (p.error || c.error) {
        throw redirect("/404")
    }
    return { detail: p.data[0], categorys: c.data }
}
export function ProductPage() {
    const { detail, categorys } = useLoaderData<{ detail: ProductDetailRead, categorys: CategoryRead[] }>();
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const sub_product_id = queryParams.get("sub_product_id")

    const [subproduct, setSubproduct] = useState<SubProductRead | null>(null)
    const [size, setSize] = useState<SizeRead | null>(null)

    // ✅ 初始化 subproduct & size（等 detail 有值才做）
    useEffect(() => {
        if (!detail || !detail.sub_products?.length) return

        let target = detail.sub_products[0]

        if (sub_product_id) {
            const found = detail.sub_products.find(
                sp => sp.id === Number(sub_product_id)
            )
            if (found) target = found
        }

        setSubproduct(target)
        setSize(target.sizes?.[0] || null)
    }, [detail, sub_product_id])

    // ✅ 預載圖片
    useEffect(() => {
        if (!detail) return

        const preloadImages = async () => {
            const promises = detail.sub_products.map(sp => {
                return new Promise<void>((resolve) => {
                    const img = new Image()
                    img.src = getImgUrl(sp.img_file_name)
                    img.onload = () => resolve()
                    img.onerror = () => resolve()
                })
            })
            await Promise.all(promises)
        }

        preloadImages()
    }, [detail])

    // ✅ 點選顏色
    const handleColor = (sp: SubProductRead) => {
        setSubproduct(sp)
        setSize(sp.sizes?.[0] || null)
    }

    // ✅ 點選尺寸
    const handleSize = (s: SizeRead) => {
        setSize(s)
    }

    // ✅ 防呆（超重要）
    if (!detail || !subproduct) {
        return <div>Loading...</div>
    }

    return (
        <CategoryAsideLayout categorys={categorys}>
            <div>
                <div className="flex">
                    {/* 商品圖片 */}
                    <div>
                        <ImageComponent.Image
                            width={500}
                            height={500}
                            src={getImgUrl(subproduct.img_file_name)}
                            alt={detail.name}
                        />
                    </div>

                    {/* 商品資訊 */}
                    <div className="flex-1">
                        <div>
                            {detail.name}-{detail.gender_name}（
                            {subproduct.color_name}－{size?.name || ""}
                            ）
                        </div>

                        <div>NT${subproduct.price}</div>

                        <hr className="my-7" />

                        {/* 顏色選擇 */}
                        <div className="mb-3">
                            {detail.sub_products.map(sp => (
                                <div
                                    key={sp.id}
                                    onClick={() => handleColor(sp)}
                                    className={`${
                                        sp.id === subproduct.id
                                            ? "border-black"
                                            : "border-white"
                                    } border mr-2 hover:cursor-pointer inline-block`}
                                >
                                    <ImageComponent.Image
                                        src={getImgUrl(sp.color_img_file_name)}
                                        alt={sp.color_name}
                                        width={24}
                                        height={24}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* 尺寸選擇 */}
                        <div>
                            {subproduct.sizes?.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => handleSize(s)}
                                    className={`${
                                        size?.id === s.id
                                            ? "border-black"
                                            : "border-white"
                                    } hover:cursor-pointer border bg-[#EEEEEE] w-[60px] h-[30px] inline-flex items-center justify-center mr-2`}
                                >
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </CategoryAsideLayout>
    )
}

export default ProductPage