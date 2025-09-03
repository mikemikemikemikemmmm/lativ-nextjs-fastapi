import { useUploadImg } from "@/hook/useUploadImg"
import { ColorRead } from "@/types/color"
import { SizeRead } from "@/types/size"
import { SubProductRead } from "@/types/subProduct"
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant"
import { getImgUrl } from "@/utils/env"
import { errorHandler } from "@/utils/errorHandler"
import { useEffect, useRef, useState } from "react"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { baseFetch } from "@/api/base"
import { dispatchError } from "@/store/method"

interface Props {
    productId: number
    colors: ColorRead[]
    subproducts: SubProductRead[]
    modalProps: SubProductRead,
    refresh: () => void
    sizes: SizeRead[]
    closeModal: () => void
}
export const SubproductModal = (props: Props) => {
    const { refresh, modalProps, closeModal, productId, colors, sizes, subproducts } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<SubProductRead>({ ...modalProps, size_ids: [...modalProps.size_ids] })
    const { handleUploadImg, imgFile, previewImgUrl, setImgFile, setPreviewImgUrl } = useUploadImg(IMG_SIZE.subProduct)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInputPass = () => {
        let pass = true
        const priceNum = Number(input.price)
        if (!Number.isInteger(priceNum) || priceNum < 1) {
            dispatchError('價格須為正整數');
            pass = false
        }
        if (input.color_id < 0 || !Number.isInteger(input.color_id)) {
            dispatchError('顏色為必須');
            pass = false
        }
        if (subproducts.some(sp => sp.color_id === input.color_id && sp.id !== input.id)) {
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
        formData.append("color_id", String(input.color_id));
        formData.append("price", String(input.price));
        formData.append("size_ids", JSON.stringify(input.size_ids));
        formData.append("product_id", String(productId));
        const { error } = isCreate ? await baseFetch(`sub_product`, {
            method: "POST",
            body: formData
        }) : await baseFetch(`sub_product/${input.id}`, {
            method: "PUT",
            body: formData
        })
        if (error) {
            return errorHandler(error)
        }
        refresh()
        handleCancel()
    }
    const handleCancel = () => {
        setImgFile(null)
        setPreviewImgUrl(null)
        closeModal()
    }
    const [imgUrl, setImgUrl] = useState<string | undefined>(() => getImgUrl(modalProps.img_file_name))
    useEffect(() => {
        if (previewImgUrl) {
            setImgUrl(previewImgUrl)
        }
        else if (isCreate) {
            setImgUrl(undefined)
        }
        else {
            setImgUrl(getImgUrl(modalProps.img_file_name))
        }
    }, [previewImgUrl])
    const handlePrice = (val: string) => {
        //@ts-ignore
        setInput({ ...input, price: val })
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

    }
    return (
        <>
            <div className="flex items-start mp2">
                <div className=" inline-block">
                    <div className="m-2 text-center">
                        {
                            imgUrl ?
                                <img className="inline-block"
                                    style={{ width: 200, height: 200 }}
                                    src={imgUrl} />
                                :
                                <div className="inline-block border flex-center"
                                    style={{ width: 200, height: 200 }}>
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
                                    {IMG_SIZE.subProduct.w}px寬
                                </div>
                                <div className="">{IMG_SIZE.subProduct.h}px高</div>
                                <div className="">jpg file</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                價格
                            </span>
                            <input value={input.price} className="flex-1 inline-block w-1/2 border ml-2 px-2" type="text" onChange={e => handlePrice(e.target.value)} />
                        </div>
                    </div>
                    <div className=" w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                顏色
                            </span>
                            <select value={input.color_id} className="ml-2 px-2 border" onChange={e => handleColor(e.target.value)}>
                                <option value={FAKE_ID_FOR_CREATE}>no selected</option>
                                {
                                    colors.map(c => <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>)
                                }
                            </select>
                        </div>
                    </div>
                    <div className=" w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                尺寸
                            </span>
                            <div className="ml-2 px-2 border">
                                {
                                    sizes.map((s) => (
                                        <label key={s.id} style={{ display: "block", cursor: "pointer" }}>
                                            <input
                                                type="checkbox"
                                                checked={input.size_ids.includes(s.id)}
                                                onChange={() => handleSizes(s.id)}
                                            />
                                            {s.name}
                                        </label>
                                    ))}
                            </div>
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