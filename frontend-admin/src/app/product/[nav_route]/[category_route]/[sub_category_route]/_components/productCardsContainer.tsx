import { ModalContainer } from "@/components/modalContainer"
import { ProductModal } from "./_modal/productModal"
import { useState } from "react"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { IconBtnGroup } from "@/components/iconBtn"
import { useGetData } from "@/hook/useGetData"
import { ProductCardRead } from "@/types/product"
import { getImgUrl } from "@/utils/env"
import { putApi } from "@/api/base"
import { errorHandler } from "@/utils/errorHandler"
import { dispatchSuccess } from "@/store/method"
import { useDrag } from "@/hook/useDrag"
export const ProductCardContainer = (props: { seriesId: number }) => {
    const { seriesId } = props
    const [getProducts, products] = useGetData<ProductCardRead>(`product/cards/${seriesId}`)
    const [modalProps, setModalProps] = useState<ProductCardRead | null>(null)
    const isModalOpen = modalProps !== null
    const handleCreate = () => {
        setModalProps({
            id: FAKE_ID_FOR_CREATE,
            img_url: "",
            name: "",
            gender_name: "",
            gender_id: FAKE_ID_FOR_CREATE,
            sub_product_count: 0,
            series_id: seriesId
        })
    }
    const handleEdit = (pc: ProductCardRead) => {
        setModalProps({ ...pc })
    }
    const { handleDragStart, handleDragOver, handleDrop } = useDrag((startId: number, endId: number) => {
        handleSwitchOrder(startId, endId)
    })
    const handleSwitchOrder = async (id1: number, id2: number) => {
        const { error } = await putApi<boolean>(`product/switch_order/${id1}/${id2}`, {
            method: "PUT"
        })
        if (error) {
            return errorHandler(error)
        }
        dispatchSuccess("交換排序成功")
        getProducts()
    }
    const closeModal = () => {
        setModalProps(null)
    }
    if (products === "loading") {
        return null
    }
    return <>
        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <ProductModal
                    refresh={getProducts}
                    seriesId={seriesId}
                    productCard={modalProps as ProductCardRead}
                    closeModal={closeModal}
                />
            </ModalContainer>
        }
        <div>
            <div className="text-right my-2">
                <div onClick={handleCreate} className="btn p-2 inline-block">新增商品</div>
            </div>
            {
                products.map(p => (
                    <div className="w-1/3 inline-block"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(p.id)}
                        key={p.id}>
                        <div className="border mp2 text-center">
                            <div>
                                <img className="w-full" src={getImgUrl(p.img_url)} />
                                <div>{p.name}-{p.gender_name}</div>
                                <div style={{ color: p.sub_product_count === 0 ? "red" : "black" }}>副產品數量{p.sub_product_count}</div>
                            </div>
                            <div>
                                <IconBtnGroup
                                    onEdit={() => handleEdit(p)}
                                    onDragStart={() => { handleDragStart(p.id) }}
                                />
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    </>
}