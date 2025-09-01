import { baseFetch, postApi, putApi } from "@/api/base"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useUploadImg } from "@/hook/useUploadImg"
import { dispatchError } from "@/store/method"
import { ColorRead } from "@/types/color"
import { SizeRead } from "@/types/size"
import { ProductModal_SubProductRead } from "@/types/subProduct"
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant"
import { getImgUrl } from "@/utils/env"
import { errorHandler } from "@/utils/errorHandler"
import { useEffect, useRef, useState } from "react"
interface Props {
    sizes: SizeRead[]
    colors: ColorRead[]
    isEditing: boolean
    productId: number
    selfSp: ProductModal_SubProductRead
    allSp: ProductModal_SubProductRead[]
    cancelEditing: () => void
}
export const SubProductModalForm = (props: Props) => {
    const { isEditing, selfSp, colors, sizes, productId, allSp, cancelEditing } = props
    const isCreate = selfSp.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<ProductModal_SubProductRead>({ ...selfSp, size_ids: [...selfSp.size_ids] })
    const { handleUploadImg, imgFile, previewImgUrl, setImgFile, setPreviewImgUrl } = useUploadImg(IMG_SIZE.subProduct)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInputPass = () => {
        // let result = true
        // if (input.price < 1) {
        //     dispatchError('名稱為必須');
        //     result = false
        // }
        // if (!Number.isInteger(input.gender_id) || input.gender_id < 0) {
        //     dispatchError('性別為必須');
        //     result = false
        // }
        // if (isCreate && (!imgFile || imgFile.size === 0)) {
        //     dispatchError('圖片為必須');
        //     result = false
        // }
        // return result;
    }
    const handleSubmit = async () => {
        // if (!isInputPass()) {
        //     return
        // }
        // const formData = new FormData();
        // if (imgFile) {
        //     formData.append("file", imgFile)
        // }
        // formData.append("price", input.name);
        // formData.append("color_id", String(input.gender_id));
        // formData.append("size_ids", String(seriesId));
        // formData.append("product_id", String(seriesId));
        // const api = isCreate ?
        //     baseFetch<ProductModal_SubProductRead>("product", {
        //         method: "POST",
        //         body: formData
        //     }) :
        //     baseFetch<ProductModal_SubProductRead>(`product/${input.id}`, {
        //         method: "PUT",
        //         body: formData
        //     })
        // const { error } = await api
        // if (error) {
        //     return errorHandler(error)
        // }
        // cancelEditing(true)
    }
    const handleColor = (val: string) => {
        const num = Number(val)
        setInput({ ...input, color_id: num })
    }
    const handleSizes = (val: any) => {
        console.log(val, 'sizes')
    }
    const handlePrice = (val: string) => {
        setInput({ ...input, name: val })
    }
    const handleCancel = () => {
        setInput({ ...selfSp })
        setImgFile(null)
        setPreviewImgUrl(null)
        cancelEditing()
    }
    const [imgUrl, setImgUrl] = useState<string | undefined>(() => selfSp.img_file_name)
    useEffect(() => {
        if (previewImgUrl) {
            setImgUrl(previewImgUrl)
        }
        else if (isCreate) {
            setImgUrl(undefined)
        } else {
            setImgUrl(getImgUrl(selfSp.img_file_name))
        }
    }, [previewImgUrl])
    return (
        <>
            <div className="flex items-start">
                <div className=" inline-block w-2/5">
                    <div className="m-2 text-center">
                        {
                            imgUrl ?

                                <img className="inline-block"
                                    style={{ width: 100, height: 100 }}
                                    src={imgUrl} />
                                :
                                <div className="inline-block border flex-center"
                                    style={{ width: 100, height: 100 }}>
                                    no img
                                </div>
                        }
                        <input
                            disabled={!isEditing}
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept=".jpg"
                            type="file"
                            onChange={e => handleUploadImg(e)}
                        />
                    </div>
                    <div>
                        <div className="m-2 flex">
                            <span className="inline-block">
                                價格
                            </span>
                            <input
                                disabled={!isEditing}
                                value={input.price}
                                className="flex-1 inline-block w-1/2 border ml-2 px-2"
                                type="text"
                                onChange={e => handlePrice(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="m-2 flex">
                            <span className="inline-block">
                                顏色
                            </span>
                            <select
                                disabled={!isEditing}
                                value={input.color_id}
                                className="flex-1 inline-block w-1/2 border ml-2 px-1"
                                onChange={(e) => handleColor(e.target.value)}
                            >
                                <option value={FAKE_ID_FOR_CREATE}>no selected</option>
                                {
                                    colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                }
                            </select>
                        </div>
                    </div>
                </div >
                <div className=" w-3/5 inline-block">
                    <div className="w-full">
                        <div className="m-2 flex-center">
                            <div className="inline-block hover:cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <AddPhotoAlternateIcon style={{ fontSize: 30 }} />
                            </div>
                            <div className="inline-block text-center">
                                <div className="">
                                    {IMG_SIZE.productCard.w}px寬 {IMG_SIZE.subProduct.h}px高
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                尺寸
                            </span>
                            
                            <select
                                multiple
                                disabled={!isEditing}
                                value={input.size_ids}
                                className="flex-1 inline-block w-1/2 border ml-2 px-1"
                                onChange={(e) => handleSizes(e.target.value)}
                            >
                                {
                                    sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                }
                            </select>
                        </div>
                    </div>
                </div>
            </div >
            {
                isEditing && <div className="w-full text-center">
                    <div className="border inline-block mp2 bg-blue-300" >
                        編輯中
                    </div>
                    <div className="btn inline-block mp2" onClick={() => handleSubmit()}>
                        送出
                    </div>
                    <div className="btn inline-block mp2" onClick={() => handleCancel()}>
                        取消
                    </div>
                </div>
            }
        </>
    )
}