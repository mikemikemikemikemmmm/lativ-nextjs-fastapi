'use client'
import { deleteApi, getApi, putApi } from "@/api/base"
import { IconBtnGroup } from "@/components/iconBtn"
import { ModalContainer } from "@/components/modalContainer"
import { useDrag } from "@/hook/useDrag"
import { useGetData } from "@/hook/useGetData"
import { ColorRead } from "@/types/color"
import { ProductRead } from "@/types/product"
import { SizeRead } from "@/types/size"
import { SubProductRead } from "@/types/subProduct"
import { getImgUrl } from "@/utils/env"
import { errorHandler } from "@/utils/errorHandler"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ProductForm } from "./_components/productForm"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { SubproductModal } from "./_components/subProductModal"
import { dispatchError } from "@/store/method"

const ProductDetailPage =() => {
    const params = useParams();
    const router = useRouter()
    const { product_id } = params
    const [product, setProduct] = useState<ProductRead | "loading">("loading")
    const getProduct = async () => {
        const { data, error } = await getApi<ProductRead>(`product/${product_id}`)
        if (error) {
            return errorHandler(error)
        }
        setProduct(data)
    }
    useEffect(() => { getProduct() }, [])
    const handleDeleteProduct = async () => {
        if (product === "loading") {
            return
        }
        if (product.sub_products.length > 0) {
            dispatchError("不能刪除還有副產品的主產品")
            return
        }
        const { error } = await deleteApi(`product/${product_id}`)
        if (error) {
            return errorHandler(error)
        }
        router.push("/product")
    }

    //----------------------------------------------
    const [modalProps, setModalProps] = useState<SubProductRead | null>(null)
    const isModalOpen = !!modalProps
    const [getSizes, sizes] = useGetData<SizeRead>(`size`)
    const [getColors, colors] = useGetData<ColorRead>(`color`)
    const handleDeleteSp = async (spId: number) => {
        if (!confirm("確認刪除")) {
            return
        }
        const { error } = await deleteApi(`sub_product/${spId}`)
        if (error) {
            return errorHandler(error)
        }
        getProduct()
    }
    const handleEditSp = (sp: SubProductRead) => {
        setModalProps({
            ...sp, size_ids: [...sp.size_ids]
        })
    }
    const handleSwitchOrderSp = async (id1: number, id2: number) => {
        const { error } = await putApi(`sub_product/switch_order/${id1}/${id2}`, {}, {}, "交換排序")
        if (error) {
            return errorHandler(error)
        }
        getProduct()
    }
    const handleCreateSp = () => {
        setModalProps({
            id: FAKE_ID_FOR_CREATE,
            color_id: FAKE_ID_FOR_CREATE,
            color_img_url: "",
            color_name: "",
            price: 0,
            img_file_name: "",
            size_ids: []
        })
    }
    const closeModal = () => {
        setModalProps(null)
    }
    const { handleDragOver, handleDragStart, handleDrop } = useDrag(handleSwitchOrderSp)
    //----------------------------------------------
    if (typeof product_id !== "string") {
        return <div>無此product</div>
    }
    if (sizes === "loading" || colors === "loading" || product === "loading") {
        return null
    }
    return <>
        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <SubproductModal
                    colors={colors}
                    productId={Number(product_id)}
                    sizes={sizes}
                    subproducts={product.sub_products}
                    modalProps={modalProps as SubProductRead}
                    closeModal={closeModal}
                    refresh={getProduct}
                />
            </ModalContainer>
        }
        <section className="my-5">
            <div className="text-center">
                <div className="inline-block btn mp2" onClick={handleCreateSp}>新增副產品</div>
                <div className="inline-block btn mp2" onClick={handleDeleteProduct}>刪除此商品</div>
            </div>
            <div className="text-center">
                <ProductForm
                    product={product}
                    refresh={getProduct}
                />
            </div>
            <div className="flex items-stretch justify-center">
                {
                    product.sub_products.map(sp => <div
                        draggable
                        onDrop={() => handleDrop(sp.id)}
                        onDragOver={handleDragOver}
                        key={sp.id}
                        className="w-1/5 inline-block"
                    >
                        <div className="mp2 border text-center">
                            <div className="flex items-stretch">
                                <div className="inline-flex items-center w-3/5">
                                    <img className="block" src={getImgUrl(sp.img_file_name)} alt={sp.color_name} />

                                </div>
                                <div className="items-center w-2/5">
                                    <div>尺寸</div>
                                    <div className="mp2 text-center overflow-y-auto h-32 border">
                                        {
                                            sp.size_ids.map(s => <div className="w-full" key={s}>
                                                {
                                                    sizes.find(_s => _s.id === s)?.name || <div />
                                                }
                                            </div>)
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="flex-center">
                                <img src={getImgUrl(sp.color_img_url)} alt={sp.color_name} className="h-5 mr-1" />
                                {sp.color_name}
                                <span className="ml-5">{sp.price}元</span>
                            </div>
                            <div>
                                <IconBtnGroup
                                    onDelete={() => handleDeleteSp(sp.id)}
                                    onEdit={() => handleEditSp(sp)}
                                    onDragStart={() => handleDragStart(sp.id)}
                                />
                            </div>
                        </div>
                    </div>)
                }
            </div>
        </section >
    </>
}
export default ProductDetailPage