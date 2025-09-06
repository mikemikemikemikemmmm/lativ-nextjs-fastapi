import { ModalContainer } from "@/components/modalContainer"
import { ProductModal } from "@/components/productModal"
import { useState } from "react"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { IconBtnGroup } from "@/components/iconBtn"
import { useGetData } from "@/hook/useGetData"
import { ProductCardRead } from "@/types/product"
import { deleteApi, putApi } from "@/api/base"
import { errorHandler } from "@/utils/errorHandler"
import { dispatchError } from "@/store/method"
import { useDrag } from "@/hook/useDrag"
import { ProductCard } from "@/components/productCard"
export const ProductCardContainer = (props: { seriesId: number }) => {
    const { seriesId } = props
    const [getProductCards, productCards] = useGetData<ProductCardRead>(`product_card/?series_id=${seriesId}`)
    const [modalProps, setModalProps] = useState<ProductCardRead | null>(null)
    const isModalOpen = !!modalProps
    const handleDelete = async (pc: ProductCardRead) => {
        if (pc.sub_product_count > 0) {
            dispatchError("還有副產品，不可刪除")
            return
        }
        if (!confirm("確定刪除嗎")) {
            return
        }
        const { error } = await deleteApi(`product/${pc.id}`)
        if (error) {
            return errorHandler(error)
        }
        getProductCards()
    }
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
    const { handleDragStart, handleDragOver, handleDrop } = useDrag((startId: number, endId: number) => {
        handleSwitchOrder(startId, endId)
    })
    const handleSwitchOrder = async (id1: number, id2: number) => {
        const { error } = await putApi<boolean>(
            `product/switch_order/${id1}/${id2}`,
            {
                method: "PUT"
            }, {}, "交換排序")
        if (error) {
            return errorHandler(error)
        }
        getProductCards()
    }
    const closeModal = () => {
        setModalProps(null)
    }
    if (productCards === "loading") {
        return null
    }
    return <>
        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <ProductModal
                    refresh={getProductCards}
                    modalProps={modalProps}
                    closeModal={closeModal}
                />
            </ModalContainer>
        }
        <div>
            <div className="text-right my-2">
                <button onClick={handleCreate} className="btn p-2 inline-block">新增商品</button>
            </div>
            <div className="grid grid-cols-5">

                {
                    productCards.map(pc => (
                        <div className="h-full flex"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(pc.id)}
                            key={pc.id}>
                                    <ProductCard pc={pc}>
                                        <div>
                                            <IconBtnGroup
                                                onDragStart={() => { handleDragStart(pc.id) }}
                                                onDelete={() => handleDelete(pc)}
                                            />
                                        </div>
                                    </ProductCard>
                        </div>
                    ))
                }
            </div>
        </div>
    </>
}