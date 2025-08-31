import { ModalContainer } from "@/components/modalContainer"
import { ProductModal } from "./productModal"
import { ProductCard } from "./productCard"
import { useState } from "react"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { IconBtnGroup } from "@/components/iconBtn"
export const ProductCardContainer = (props: { productIds: number[], seriesId: number }) => {
    const { productIds, seriesId } = props
    const [editingProductId, setEditingProductId] = useState<number | null>(null)
    const isModalOpen = editingProductId !== null
    const handleCreate = () => {
        setEditingProductId(FAKE_ID_FOR_CREATE)
    }
    const handleEdit = (spi: number) => {
        setEditingProductId(spi)
    }
    const handleSwitchOrder = (id1: number, id2: number) => {

    }
    const closeModal = () => {
        setEditingProductId(null)
    }
    return <>
        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <ProductModal
                    seriesId={seriesId}
                    productId={editingProductId as number}
                    closeModal={closeModal}
                />
            </ModalContainer>
        }
        <div>
            <div className="text-right my-2">
                <div onClick={handleCreate} className="btn p-2 inline-block">新增商品</div>
            </div>
            {
                productIds.map(pi => <div className="border mp2" key={pi}>
                    <ProductCard
                        productId={pi}
                    />
                    <div className="text-center">
                        <IconBtnGroup
                            onEdit={() => handleEdit(pi)}
                            onDragStart={() => { }}
                        />
                    </div>
                </div>)
            }
        </div>
    </>
}