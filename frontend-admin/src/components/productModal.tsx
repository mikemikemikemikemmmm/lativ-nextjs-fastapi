import { baseFetch } from "@/api/base"
import { dispatchError } from "@/store/method"
import { GenderRead } from "@/types/gender"
import { ProductCardRead, ProductRead } from "@/types/product"
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant"
import { errorHandler } from "@/utils/errorHandler"
import { useEffect, useRef, useState } from "react"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useUploadImg } from "@/hook/useUploadImg"
import { getImgUrl } from "@/utils/env"
import { useGetData } from "@/hook/useGetData"

interface Props {
    modalProps: ProductCardRead
    refresh: () => void
    closeModal: () => void
}
export const ProductModal = (props: Props) => {
    const { refresh, modalProps, closeModal } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<ProductCardRead>({ ...modalProps })
    const { handleUploadImg, imgFile, previewImgUrl, setImgFile, setPreviewImgUrl } = useUploadImg(IMG_SIZE.productCard)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
            result = false
        }
        if (input.gender_id < 0 || !Number.isInteger(input.gender_id)) {
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
        formData.append("series_id", String(input.series_id));
        const { error } = isCreate ? await baseFetch(`product`, {
            method: "POST",
            body: formData
        })
            : await baseFetch(`product/${input.id}`, {
                method: "PUT",
                body: formData
            })
        if (error) {
            return errorHandler(error)
        }
        setImgFile(null)
        setPreviewImgUrl(null)
        refresh()
        closeModal()
    }
    const handleChangeName = (val: string) => {
        setInput({ ...input, name: val })
    }
    const [getGenders, genders] = useGetData<GenderRead>(`gender`)
    const handleGender = (genderid: string) => {
        setInput({ ...input, gender_id: Number(genderid) })
    }
    const handleCancel = () => {
        setImgFile(null)
        setPreviewImgUrl(null)
        closeModal()
    }
    const [imgUrl, setImgUrl] = useState<string | undefined>(() => modalProps.img_url)
    useEffect(() => {
        if (previewImgUrl) {
            setImgUrl(previewImgUrl)
        } else if (isCreate) {
            setImgUrl(undefined)
        }
        else {
            setImgUrl(getImgUrl(modalProps.img_url))
        }
    }, [previewImgUrl])
    if (genders === "loading") {
        return null
    }
    return (
        <>
            <div className="flex items-start mp2">
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
                            <div className="inline-block text-center ml-2">
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
                            <input value={input.name} className="flex-1 inline-block w-1/2 border ml-2 px-2" type="text" onChange={e => handleChangeName(e.target.value)} />
                        </div></div>
                    <div className=" w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                性別
                            </span>
                            <select className="ml-2 px-2 border" value={input.gender_id} onChange={e => handleGender(e.target.value)}>
                                <option value={FAKE_ID_FOR_CREATE}>
                                    no selected
                                </option>
                                {
                                    genders.map(g => <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>)
                                }
                            </select>
                        </div>
                    </div>
                </div>
            </div >
            {
                <div className="w-full text-center">
                    <button className="btn inline-block mp2" onClick={() => handleSubmit()}>
                        送出
                    </button>
                    <button className="btn inline-block mp2" onClick={() => handleCancel()}>
                        取消
                    </button>
                </div>
            }
        </>
    )
}