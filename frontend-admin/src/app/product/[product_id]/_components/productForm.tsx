
import { ProductRead } from "@/types/product"
import { useState } from "react"
import { getImgUrl } from "@/utils/env"
import { ModalContainer } from "@/components/modalContainer"
import { ProductModal } from "@/components/productModal"
import { IconBtnGroup } from "@/components/iconBtn"

interface Props {
    product: ProductRead
    refresh: () => void
}
export const ProductForm = (props: Props) => {
    const { product, refresh } = props
    const [modalProps, setModalProps] = useState<ProductRead | null>(null)
    const isModalOpen = !!modalProps
    const closeModal = () => {
        setModalProps(null)
    }
    const handleEdit = () => {
        setModalProps({ ...product, sub_products: [] })
    }
    return (
        <>

            {isModalOpen &&
                <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                    <ProductModal
                        modalProps={modalProps as ProductRead}
                        closeModal={closeModal}
                        refresh={refresh}
                    />
                </ModalContainer>
            }
            <div className="inline-block mp2 border">
                <div className="flex items-start">
                    <div className="inline-block">
                        <img
                            style={{ width: 100, height: 150 }}
                            src={getImgUrl(product.img_url)}  alt={"product"}/>
                    </div >
                    <div className="flex-1 inline-block text-left ml-2">
                        <div className="text-right mb-2">
                            <IconBtnGroup onEdit={handleEdit} />
                        </div>
                        <div>
                            名稱：{product.name}
                        </div>
                        <div>
                            性別：{product.gender_name}
                        </div>
                        <div>
                            副產品數量：{product.sub_product_count}
                        </div>
                    </div>
                </div >
            </div>
        </>
    )
}