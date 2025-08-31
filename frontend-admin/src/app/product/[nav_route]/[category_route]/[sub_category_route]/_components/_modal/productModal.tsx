
import { useEffect, useState } from "react"
import { SubProductModalForm } from "./subProductForm"
import { ProductModalForm } from "./productForm"
import { IconBtnGroup } from "@/components/iconBtn"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { getApi } from "@/api/base"
import { errorHandler } from "@/utils/errorHandler"
import { ProductCardRead } from "@/types/product"
import { ColorRead } from "@/types/color"
import { SizeRead } from "@/types/size"
import { useGetData } from "@/hook/useGetData"
import { GenderRead } from "@/types/gender"
import { ProductModal_SubProductRead } from "@/types/subProduct"
import { useDrag } from "@/hook/useDrag"
export const ProductModal = (props: { closeModal: () => void, productCard: ProductCardRead, seriesId: number }) => {
    const { productCard, closeModal, seriesId } = props
    const isCreate = productCard.id === FAKE_ID_FOR_CREATE
    const [subProducts, setSubProducts] = useState<ProductModal_SubProductRead[] | "loading">(() => {
        return isCreate ? [] : "loading"
    })
    useEffect(() => {
        if (isCreate) {
            handleEditProduct()
        }
    }, [isCreate])
    const getSubproducts = async () => {
        const { data, error } = await getApi<ProductModal_SubProductRead[]>(`sub_product/modal/${productCard.id}`)
        if (error) {
            return errorHandler(error)
        }
        setSubProducts(data)
    }
    useEffect(() => {
        if (isCreate) {
            handleEditProduct()
        } else {
            getSubproducts()
        }
    }, [isCreate])
    //number is subproductId
    const [editing, setEditing] = useState<"product" | "noEditing" | number>("noEditing")
    const [getColors, colors] = useGetData<ColorRead>("color")
    const [getSizes, sizes] = useGetData<SizeRead>("size")
    const [getGenders, genders] = useGetData<GenderRead>("gender")
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
    const handleSwitchOrderSubproduct = (start: number, end: number) => {

    }
    const { handleDragStart, handleDragOver, handleDrop } = useDrag((startId: number, endId: number) => {
        handleSwitchOrderSubproduct(startId, endId)
    })
    if (genders === "loading" || sizes === "loading" || colors === "loading" || subProducts === "loading") {
        return null
    }
    return <div>
        <div className="text-right">
            <div className="inline-block btn mp2">
                新增副產品
            </div>
            <div className="inline-block btn mp2">
                刪除此商品
            </div>
        </div>
        <div className="border mp2">
            <ProductModalForm
                genders={genders as GenderRead[]}
                isEditing={editing === "product"}
                product={productCard}
                seriesId={seriesId}
            />
            <div className="text-right">
                <IconBtnGroup onEdit={handleDeleteProduct} />
            </div>

        </div>
        <div>
            {
                subProducts.map(sp => <div
                    draggable
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(sp.id)}
                    key={sp.id}>
                    <SubProductModalForm
                        sizes={sizes}
                        colors={colors}
                        isEditing={editing === sp.id}
                        productId={productCard.id}
                        subproduct={sp}
                    />
                    <div className="text-right">
                        <IconBtnGroup
                            onEdit={() => handleEditSubproduct(sp.id)}
                            onDelete={() => handleDeleteSubproduct(sp.id)}
                            onDragStart={() => handleDragStart(sp.id)}
                        />
                    </div>
                </div>)
            }
        </div>
    </div>
}