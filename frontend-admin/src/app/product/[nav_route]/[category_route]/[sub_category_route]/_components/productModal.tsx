
import { useEffect, useState } from "react"
import { SubProductModalForm } from "./subProductForm"
import { ProductModalForm } from "./productForm"
import { IconBtnGroup } from "@/components/iconBtn"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { getApi } from "@/api/base"
import { errorHandler } from "@/utils/errorHandler"
import { ProductModalRead } from "@/types/product"

export const ProductModal = (props: { closeModal: () => void, productId: number, seriesId: number }) => {
    const { productId, closeModal, seriesId } = props
    const isCreate = productId === FAKE_ID_FOR_CREATE
    useEffect(() => {
        if (isCreate) {
            handleEditProduct()
        }
    }, [isCreate])
    const [product, setProduct] = useState<ProductModalRead>({
        id: FAKE_ID_FOR_CREATE,
        gender_id: FAKE_ID_FOR_CREATE,
        gender_name: "",
        series_id: seriesId,
        sub_product_ids: [],
        name: ""
    })
    const getProduct = async () => {
        const { data, error } = await getApi<ProductModalRead>(`product/modal/${productId}`)
        if (error) {
            return errorHandler(error)
        }
        setProduct(data)
    }
    useEffect(() => {
        if (isCreate) {
            handleEditProduct()
        } else {
            getProduct()
        }
    }, [isCreate])
    //number is subproductId
    const [editing, setEditing] = useState<"product" | "noEditing" | number>("noEditing")

    //---------------------------------------------------------------//
    const handleEditProduct = () => {
        setEditing("product")
    }
    const handleDeleteProduct = () => {
        //TODO
    }
    //---------------------------------------------------------------//
    const handleEditSubproduct = (id: number) => {
        setEditing(id)
    }
    const handleDeleteSubproduct = (id: number) => {
        //TODO
    }
    return <div>
        <div className="btn mp2">
            刪除商品
        </div>
        <div>
            <ProductModalForm isEditing={editing === "product"} product={product} seriesId={seriesId} />
            <div>
            </div>
        </div>
        <div>
            {
                product.sub_product_ids.map(spi => <div key={spi}>
                    <SubProductModalForm isEditing={editing === spi} productId={productId} subproductId={spi} />
                </div>)
            }
        </div>
    </div>
}