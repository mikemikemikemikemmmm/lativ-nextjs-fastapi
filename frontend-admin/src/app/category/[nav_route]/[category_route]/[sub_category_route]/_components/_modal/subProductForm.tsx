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
import { ChangeEvent, useEffect, useRef, useState } from "react"
interface Props {
    sizes: SizeRead[]
    colors: ColorRead[]
    isEditing: boolean
    productId: number
    selfSp: ProductModal_SubProductRead
    allSp: ProductModal_SubProductRead[]
    cancelEditing: (needRefresh?: boolean) => void
}
export const SubProductModalForm = (props: Props) => {
    const { isEditing, selfSp, colors, sizes, productId, allSp, cancelEditing } = props
    const isCreate = selfSp.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<ProductModal_SubProductRead>({ ...selfSp, size_ids: [...selfSp.size_ids] })
    const { handleUploadImg, imgFile, previewImgUrl, setImgFile, setPreviewImgUrl } = useUploadImg(IMG_SIZE.subProduct)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInputPass = () => {
        let pass = true
        const priceNum = Number(input.price)
        if (!Number.isInteger(priceNum) || priceNum < 1) {
            dispatchError('價格須為正整數');
            pass = false
        }
        if (input.color_id < 0) {
            dispatchError('顏色為必須');
            pass = false
        }
        if (allSp.some(sp => sp.color_id === input.color_id && sp.id !== input.id)) {
            dispatchError('此顏色已被其他副產品使用');
            pass = false
        }
        if (isCreate && (!imgFile || imgFile.size === 0)) {
            dispatchError('圖片為必須');
            pass = false
        }
        if (input.size_ids.length <= 0) {
            dispatchError('至少要有一個尺寸');
            pass = false
        }
        return pass;
    }
    const handleSubmit = async () => {
        if (!isInputPass()) {
            return
        }
        const formData = new FormData();
        if (imgFile) {
            formData.append("file", imgFile)
        }
        formData.append("price", String(input.price));
        formData.append("color_id", String(input.color_id));
        formData.append("size_ids", JSON.stringify(input.size_ids));
        formData.append("product_id", String(productId));
        const api = isCreate ?
            baseFetch<ProductModal_SubProductRead>("sub_product", {
                method: "POST",
                body: formData
            }) :
            baseFetch<ProductModal_SubProductRead>(`sub_product/${input.id}`, {
                method: "PUT",
                body: formData
            })
        const { error } = await api
        if (error) {
            return errorHandler(error)
        }
        cancelEditing(true)
    }
    const handleColor = (val: string) => {
        const num = Number(val)
        setInput({ ...input, color_id: num })
    }
    const handleSizes = (id: number) => {
        setInput((prev) => {
            const exists = prev.size_ids.includes(id);
            let newSizeIds: number[];
            if (exists) {
                // 移除
                newSizeIds = prev.size_ids.filter((sid) => sid !== id);
            } else {
                // 加入
                newSizeIds = [...prev.size_ids, id];
            }

            // 按 order 排序
            const sortedIds = sizes
                .filter((s) => newSizeIds.includes(s.id))
                .sort((a, b) => a.order - b.order)
                .map((s) => s.id);

            return { ...prev, size_ids: sortedIds };
        });
    };
    const handlePrice = (val: string) => {
        //@ts-ignore
        setInput({ ...input, price: val })
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
                <div className="flex-1">
                    <div className="mx-2 mb-2 flex-center">
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
                    {
                        isEditing &&
                        <div className="w-full">
                            <div className="m-2 flex-center">
                                <div className="inline-block hover:cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <AddPhotoAlternateIcon style={{ fontSize: 40 }} />
                                </div>
                                <div className="inline-block ml-2 text-center">
                                    <div className="">
                                        {IMG_SIZE.subProduct.w}px寬
                                    </div>
                                    <div className="">{IMG_SIZE.subProduct.h}px高</div>
                                </div>
                            </div>
                        </div>
                    }
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
                            {
                                isEditing &&
                                <span className="inline-block">
                                    顏色
                                </span>
                            }
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
                {
                    isEditing && <div className="flex mp2 flex-col">
                        <div className="text-center">尺寸選擇</div>
                        <div className="border inline-block p-2 h-44 overflow-y-scroll">
                            {
                                sizes.map((s) => (
                                    <label key={s.id} style={{ display: "block", cursor: "pointer" }}>
                                        <input
                                            disabled={!isEditing}
                                            type="checkbox"
                                            checked={input.size_ids.includes(s.id)}
                                            onChange={() => handleSizes(s.id)}
                                        />
                                        {s.name}
                                    </label>
                                ))}
                        </div>
                    </div>
                }

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