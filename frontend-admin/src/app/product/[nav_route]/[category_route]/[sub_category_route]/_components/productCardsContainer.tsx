import { ModalContainer } from "@/components/modalContainer"
import { ProductModal } from "./_modal/productModal"
import { useState } from "react"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { IconBtnGroup } from "@/components/iconBtn"
import { useGetData } from "@/hook/useGetData"
import { ProductCardRead } from "@/types/product"
export const ProductCardContainer = (props: { seriesId: number }) => {
    const { seriesId } = props
    const [getCards, cards] = useGetData<ProductCardRead>(`product/cards/${seriesId}`)
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
    const handleSwitchOrder = (id1: number, id2: number) => {

    }
    const closeModal = () => {
        setModalProps(null)
    }
    if (cards === "loading") {
        return null
    }
    return <>
        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <ProductModal
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
                cards.map(c => <div className="border mp2" key={c.id}>
                    <div>
                        <img src={c.img_url} />
                        <div>{c.name}-{c.gender_name}</div>
                        <div>副產品數量{c.sub_product_count}</div>
                    </div>
                    <div className="text-center">
                        <IconBtnGroup
                            onEdit={() => handleEdit(c)}
                            onDragStart={() => { }}
                        />
                    </div>
                </div>)
            }
        </div>
    </>
}