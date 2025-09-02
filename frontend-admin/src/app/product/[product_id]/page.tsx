'use client'
import { deleteApi, getApi, putApi } from "@/api/base"
import { IconBtnGroup } from "@/components/iconBtn"
import { useDrag } from "@/hook/useDrag"
import { useGetData } from "@/hook/useGetData"
import { ColorRead } from "@/types/color"
import { ProductCardRead, ProductRead } from "@/types/product"
import { SizeRead } from "@/types/size"
import { SubProductRead } from "@/types/subProduct"
import { getImgUrl } from "@/utils/env"
import { errorHandler } from "@/utils/errorHandler"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

// export default () => {
//     const rowLimit = 5 
//     const [searchStr, setSearchStr] = useState("")
//     const handleSearch = async () => {
//         const api = searchStr === "" ? getApi<ProductCardRead[]>(`product/cards/`) : getApi<ProductCardRead[]>(`product/cards/?product_name=${searchStr}&limit=${rowLimit}`)
//         const { data, error } = await api
//         if (error) {
//             return errorHandler(error)
//         }
//         setSearchRow(data)
//     }
//     const [seachRow, setSearchRow] = useState<ProductCardRead[]>([])
//     return <section>
//         <div className="flex-center">
//             <span className="mp2">
//                 產品名稱
//             </span>
//             <input type="text" className="mp2 border " value={searchStr} onChange={e => setSearchStr(e.target.value)} />
//             <span className="btn mp2" onClick={handleSearch}>
//                 搜尋
//             </span>
//         </div>
//         <div>

//         </div>

//     </section>
// }
export default () => {
    const params = useParams();
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
    const [getSizes, sizes] = useGetData<SizeRead>(`size`)
    const [getColors, colors] = useGetData<ColorRead>(`color`)
    //----------------------------------------------
    const handleDeleteSp = async (spId: number) => {
        if (!confirm("確認刪除")) {
            return
        }
        const { error } = await deleteApi(`sub_product/${spId}`)
        if (error) {
            return errorHandler(error)
        }
    }
    const handleEditSp = (sp: SubProductRead) => {

    }
    const handleSwitchOrder = async (id1: number, id2: number) => {
        const { error } = await putApi(`sub_product/switch_order/${id1}/${id2}`, {}, {}, "交換排序")
        if (error) {
            return errorHandler(error)
        }
    }
    const { handleDragOver, handleDragStart, handleDrop } = useDrag(handleSwitchOrder)
    const handleCreateSp = () => { }
    const handleEditProduct = () => { }
    const handleDelete = () => {

    }
    if (sizes === "loading" || colors === "loading" || product === "loading") {
        return null
    }

    return <section className="my-5">
        <div className="text-center">
            <div className="inline-block btn mp2">新增副產品</div>
            <div className="inline-block btn mp2">編輯主產品</div>
            <div className="inline-block btn mp2" >刪除此商品</div>
        </div>
        <div className="text-center">
            <div className="mp2 inline-block border text-center">
                <img src={getImgUrl(product.img_url)} alt={product.name} className="block h-52" />
                <div className="flex">
                    <div className="inline-flex items-center">名稱</div>
                    <div className="flex-1 inline-block border mp2">
                        {product.name}
                    </div>
                </div>
                <div className="flex">
                    <div className="inline-flex items-center">性別</div>

                    <div className="flex-1 inline-block border mp2">
                        {product.gender_name}</div>
                </div>
            </div>
        </div>
        <div className="flex items-stretch">
            {
                product.sub_products.map(sp => <div
                    draggable
                    onDrop={() => handleDrop(sp.id)}
                    onDragOver={handleDragOver}
                    key={sp.id}
                    className="w-1/6 inline-block"
                >
                    <div className="mp2 border text-center">
                        <div className="flex items-stretch">
                            <div className="inline-flex items-center w-2/3">
                                <img className="block" src={getImgUrl(sp.img_file_name)} alt={sp.color_name} />

                            </div>
                            <div className="inline-flex flex-col  items-center w-1/3">
                                <div>尺寸</div>
                                <div className="mp2 text-center overflow-y-scroll h-32 w-10 border">
                                    {
                                        sp.size_ids.map(s => <div key={s}>
                                            {
                                                (sizes.find(_s => _s.id === s) as SizeRead).name
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
    </section>
}