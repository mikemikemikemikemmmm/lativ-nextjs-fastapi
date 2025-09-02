
import { useEffect, useState } from "react"
import { SubProductModalForm } from "./subProductForm"
import { ProductModalForm } from "./productForm"
import { IconBtnGroup } from "@/components/iconBtn"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { deleteApi, getApi, putApi } from "@/api/base"
import { errorHandler } from "@/utils/errorHandler"
import { ProductCardRead } from "@/types/product"
import { ColorRead } from "@/types/color"
import { SizeRead } from "@/types/size"
import { useGetData } from "@/hook/useGetData"
import { GenderRead } from "@/types/gender"
import { ProductModal_SubProductRead } from "@/types/subProduct"
import { useDrag } from "@/hook/useDrag"
import { dispatchError, dispatchSuccess } from "@/store/method"
interface Props {
    refresh: () => void,
    closeModal: () => void,
    productCard: ProductCardRead,
    seriesId: number
}
export const ProductModal = (props: Props) => {
    const { productCard, closeModal, seriesId, refresh } = props
    const isCreate = productCard.id === FAKE_ID_FOR_CREATE
    const [getGenders, genders] = useGetData<GenderRead>("gender")
    //product--------------------------------------------------
    if (genders === "loading") {
        return null
    }
    return <div>

    </div>
}


// import { useEffect, useState } from "react"
// import { SubProductModalForm } from "./subProductForm"
// import { ProductModalForm } from "./productForm"
// import { IconBtnGroup } from "@/components/iconBtn"
// import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
// import { deleteApi, getApi, putApi } from "@/api/base"
// import { errorHandler } from "@/utils/errorHandler"
// import { ProductCardRead } from "@/types/product"
// import { ColorRead } from "@/types/color"
// import { SizeRead } from "@/types/size"
// import { useGetData } from "@/hook/useGetData"
// import { GenderRead } from "@/types/gender"
// import { ProductModal_SubProductRead } from "@/types/subProduct"
// import { useDrag } from "@/hook/useDrag"
// import { dispatchError, dispatchSuccess } from "@/store/method"
// interface Props {
//     refresh: () => void,
//     closeModal: () => void,
//     productCard: ProductCardRead,
//     seriesId: number
// }
// export const ProductModal = (props: Props) => {
//     const { productCard, closeModal, seriesId, refresh } = props
//     const isCreate = productCard.id === FAKE_ID_FOR_CREATE
//     const [editing, setEditing] = useState<"product" | "noEditing" | number>("noEditing")//number is subproductId
//     const [getColors, colors] = useGetData<ColorRead>("color")
//     const [getSizes, sizes] = useGetData<SizeRead>("size")
//     const [getGenders, genders] = useGetData<GenderRead>("gender")
//     //product--------------------------------------------------
//     const handleEditProduct = () => {
//         setEditing("product")
//     }
//     const handleDeleteProduct = async () => {
//         if (subProducts.length > 0) {
//             dispatchError("請刪除所有副產品再刪除主產品")
//             return
//         }
//         if (!confirm("確定刪除嗎")) {
//             return
//         }
//         const { error } = await deleteApi(`product/${productCard.id}`)
//         if (error) {
//             return errorHandler(error)
//         }
//         refresh()
//         closeModal()
//     }
//     const handleCancelEditProduct = (needRefresh: boolean = false) => {
//         setEditing("noEditing")
//         if (needRefresh) {
//             refresh()
//         }
//         if (isCreate) {
//             closeModal()
//         }
//     }
//     //subproduct--------------------------------------------------
//     const [subProducts, setSubProducts] = useState<ProductModal_SubProductRead[] | "loading">(() => {
//         return isCreate ? [] : "loading"
//     })
//     const handleCancelEditSubProduct = (needRefresh: boolean = false) => {
//         setEditing("noEditing")
//         if (subProducts === "loading") {
//             return
//         }
//         getSubproducts()

//     }
//     const getSubproducts = async () => {
//         const { data, error } = await getApi<ProductModal_SubProductRead[]>(`sub_product/modal/${productCard.id}`)
//         if (error) {
//             return errorHandler(error)
//         }
//         setSubProducts(data)
//     }
//     const handleEditSubproduct = (id: number) => {
//         setEditing(id)
//     }
//     const handleDeleteSubproduct = async (subproductId: number) => {
//         if (!confirm("確定刪除嗎")) {
//             return
//         }
//         const { error } = await deleteApi(`sub_product/${subproductId}`)
//         if (error) {
//             return errorHandler(error)
//         }
//         getSubproducts()
//     }
//     const handleSwitchOrderSubproduct = async (id1: number, id2: number) => {
//         const { error } = await putApi<boolean>(`sub_product/switch_order/${id1}/${id2}`, {
//             method: "PUT"
//         })
//         if (error) {
//             return errorHandler(error)
//         }
//         dispatchSuccess("交換排序成功")
//         getSubproducts()

//     }
//     const { handleDragStart, handleDragOver, handleDrop } = useDrag((startId: number, endId: number) => {
//         handleSwitchOrderSubproduct(startId, endId)
//     })
//     const handleCreateSubproduct = () => {
//         const newSp = {
//             id: FAKE_ID_FOR_CREATE,
//             price: 1,
//             img_file_name: "",
//             color_id: FAKE_ID_FOR_CREATE,
//             color_name: "",
//             color_img_url: "",
//             size_ids: []
//         } as ProductModal_SubProductRead
//         setSubProducts(prev => {
//             if (prev === "loading") {
//                 return prev
//             }
//             return [...prev, newSp]
//         })
//     }

//     useEffect(() => {
//         if (subProducts === "loading") {
//             return
//         }
//         const len = subProducts.length
//         if (subProducts.length === 0) {
//             return
//         }
//         const lastSp = subProducts[len - 1]
//         if (lastSp.id === FAKE_ID_FOR_CREATE) { //after create new sp ,edit it
//             handleEditSubproduct(lastSp.id)

//             const modalContainerDom = document.getElementById("modal-container");
//             console.log(modalContainerDom, 123)
//             if (!modalContainerDom) {
//                 return
//             }
//             modalContainerDom.scrollTop = modalContainerDom.scrollHeight;
//             modalContainerDom.scrollTo({ top: modalContainerDom.scrollHeight, behavior: "smooth" });
//         }
//     }, [subProducts])
//     //--------------------------------------------------
//     useEffect(() => {
//         if (isCreate) {
//             handleEditProduct()
//         } else {
//             getSubproducts()
//         }
//     }, [isCreate])
//     if (genders === "loading" || sizes === "loading" || colors === "loading" || subProducts === "loading") {
//         return null
//     }
//     return <div className="relative bg-white" id="product-modal">
//         <div className="text-right sticky top-0 bg-white">
//             {
//                 editing === "noEditing" &&
//                 <>
//                     <div className="inline-block btn mp2" onClick={handleEditProduct}>
//                         編輯主產品
//                     </div>
//                     <div className="inline-block btn mp2" onClick={handleCreateSubproduct}>
//                         新增副產品
//                     </div>
//                     <div className="inline-block btn mp2" onClick={handleDeleteProduct}>
//                         刪除此商品
//                     </div>
//                 </>
//             }
//         </div>
//         <div className="flex flex-wrap items-stretch">
//             <div className="w-2/5">
//                 <div className="h-full p-2">
//                     <div className=" h-full border">
//                         <div className="p-2 ">
//                             <ProductModalForm
//                                 genders={genders as GenderRead[]}
//                                 isEditing={editing === "product"}
//                                 product={productCard}
//                                 seriesId={seriesId}
//                                 cancelEditing={handleCancelEditProduct}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             {
//                 subProducts.map(sp => <div key={sp.id} className={editing !== sp.id ? "w-1/5" : "w-full"}>
//                     <div
//                         className="border mp2"
//                         draggable={editing !== sp.id}
//                         onDragOver={handleDragOver}
//                         onDrop={() => handleDrop(sp.id)}
//                     >
//                         <SubProductModalForm
//                             allSp={subProducts}
//                             selfSp={sp}
//                             sizes={sizes}
//                             colors={colors}
//                             isEditing={editing === sp.id}
//                             productId={productCard.id}
//                             cancelEditing={() => handleCancelEditSubProduct()}
//                         />
//                         {
//                             sp.id !== FAKE_ID_FOR_CREATE &&

//                             <div className="text-center">
//                                 <IconBtnGroup
//                                     onEdit={() => handleEditSubproduct(sp.id)}
//                                     onDelete={() => handleDeleteSubproduct(sp.id)}
//                                     onDragStart={() => handleDragStart(sp.id)}
//                                 />
//                             </div>
//                         }
//                     </div>
//                 </div>)
//             }
//         </div>
//     </div>
// }