import { ModalContainer } from "@/components/modalContainer"
import { ProductModal } from "./_modal/productModal"
import { useState } from "react"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { IconBtnGroup } from "@/components/iconBtn"
import { useGetData } from "@/hook/useGetData"
import { ProductCardRead } from "@/types/product"
import { getImgUrl } from "@/utils/env"
import { deleteApi, putApi } from "@/api/base"
import { errorHandler } from "@/utils/errorHandler"
import { dispatchError, dispatchSuccess } from "@/store/method"
import { useDrag } from "@/hook/useDrag"
import { ProductCard } from "@/components/productCard"
export const ProductCardContainer = (props: { seriesId: number }) => {
    const { seriesId } = props
    const [getProductCards, productCards] = useGetData<ProductCardRead>(`product/cards/${seriesId}`)
    const [modalProps, setModalProps] = useState<ProductCardRead | null>(null)
    const isModalOpen = modalProps !== null
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
                productCards.map(pc => (
                    <div className="w-1/6 inline-block"
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
    </>
}


// {
//     products.map(p => (
//         <div className="w-1/3 inline-block"
//             onDragOver={handleDragOver}
//             onDrop={() => handleDrop(p.id)}
//             key={p.id}>
//             <div className="border mp2 text-center">
//                 <div>
//                     <img className="w-full" src={getImgUrl(p.img_url)} />
//                     <div>{p.name}-{p.gender_name}</div>
//                     <div style={{ color: p.sub_product_count === 0 ? "red" : "black" }}>副產品數量{p.sub_product_count}</div>
//                 </div>
//                 <div>
//                     <IconBtnGroup
//                         onEdit={() => handleEdit(p)}
//                         onDragStart={() => { handleDragStart(p.id) }}
//                     />
//                 </div>
//             </div>
//         </div>
//     ))
// }