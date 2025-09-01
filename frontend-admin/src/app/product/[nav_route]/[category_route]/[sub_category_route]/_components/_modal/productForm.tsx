import { baseFetch } from "@/api/base"
import { dispatchError } from "@/store/method"
import { GenderRead } from "@/types/gender"
import { ProductCardRead } from "@/types/product"
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant"
import { errorHandler } from "@/utils/errorHandler"
import { useEffect, useRef, useState } from "react"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useUploadImg } from "@/hook/useUploadImg"
import { getImgUrl } from "@/utils/env"

interface Props {
    isEditing: boolean
    product: ProductCardRead
    seriesId: number
    genders: GenderRead[]
    cancelEditing: (refresh?: boolean) => void
}
export const ProductModalForm = (props: Props) => {
    const { isEditing, product, seriesId, genders, cancelEditing } = props
    const isCreate = product.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<ProductCardRead>({ ...product })
    const { handleUploadImg, imgFile, previewImgUrl, setImgFile, setPreviewImgUrl } = useUploadImg(IMG_SIZE.productCard)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleGender = (genderId: string) => {
        const num = Number(genderId)
        if (!Number.isInteger(num) || num < 0) {
            return
        }
        setInput({ ...input, gender_id: num })
    }
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
            result = false
        }
        if (!Number.isInteger(input.gender_id) || input.gender_id < 0) {
            dispatchError('性別為必須');
            result = false
        }
        if (isCreate && (!imgFile || imgFile.size === 0)) {
            dispatchError('圖片為必須');
            result = false
        }
        return result;
    }
    const handleSubmit = async () => {
        if (!isInputPass()) {
            return
        }
        const formData = new FormData();
        if (imgFile) {
            formData.append("file", imgFile)
        }
        formData.append("product_name", input.name);
        formData.append("gender_id", String(input.gender_id));
        formData.append("series_id", String(seriesId));
        const api = isCreate ?
            baseFetch<ProductCardRead>("product", {
                method: "POST",
                body: formData
            }) :
            baseFetch<ProductCardRead>(`product/${input.id}`, {
                method: "PUT",
                body: formData
            })
        const { error } = await api
        if (error) {
            return errorHandler(error)
        }
        cancelEditing(true)
    }
    const handleChangeName = (val: string) => {
        setInput({ ...input, name: val })
    }
    const handleCancel = () => {
        setInput({ ...product })
        setImgFile(null)
        setPreviewImgUrl(null)
        cancelEditing()
    }
    const [imgUrl, setImgUrl] = useState<string | undefined>(() => product.img_url)
    useEffect(() => {
        if (previewImgUrl) {
            setImgUrl(previewImgUrl)
        }
        else if (isCreate) {
            setImgUrl(undefined)
        } else {
            setImgUrl(getImgUrl(product.img_url))
        }
    }, [previewImgUrl])
    return (
        <>
            <div className="flex items-start">
                <div className=" inline-block">
                    <div className="m-2 text-center">
                        {
                            imgUrl ?

                                <img className="inline-block"
                                    style={{ width: 100, height: 150 }}
                                    src={imgUrl} />
                                :
                                <div className="inline-block border flex-center"
                                    style={{ width: 100, height: 150 }}>
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
                </div >
                <div className="flex-1 inline-block">
                    <div className="w-full">
                        <div className="m-2 flex-center">
                            <div className="inline-block hover:cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <AddPhotoAlternateIcon style={{ fontSize: 40 }} />
                            </div>
                            <div className="inline-block text-center">
                                <div className="">
                                    {IMG_SIZE.productCard.w}px寬
                                </div>
                                <div className="">{IMG_SIZE.productCard.h}px高</div>
                                <div className="">jpg file</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                名稱
                            </span>
                            <input disabled={!isEditing} value={input.name} className="flex-1 inline-block w-1/2 border ml-2 px-2" type="text" onChange={e => handleChangeName(e.target.value)} />
                        </div></div>
                    <div className=" w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                性別
                            </span>
                            <select disabled={!isEditing} value={input.gender_id} className="flex-1 inline-block w-1/2 border ml-2 px-1" onChange={(e) => handleGender(e.target.value)} >
                                <option value={FAKE_ID_FOR_CREATE}>no selected</option>
                                {
                                    genders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)
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