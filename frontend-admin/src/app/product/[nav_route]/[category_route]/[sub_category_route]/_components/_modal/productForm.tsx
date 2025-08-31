import { postApi, putApi } from "@/api/base"
import { useGetData } from "@/hook/useGetData"
import { dispatchError } from "@/store/method"
import { GenderRead } from "@/types/gender"
import { ProductCardRead, ProductModalRead } from "@/types/product"
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant"
import { errorHandler } from "@/utils/errorHandler"
import { useRef, useState } from "react"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface Props {
    isEditing: boolean
    product: ProductCardRead
    seriesId: number
    genders: GenderRead[]
}
export const ProductModalForm = (props: Props) => {
    const { isEditing, product, seriesId, genders } = props
    const isCreate = product.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<ProductCardRead>({ ...product })
    const [imgFile, setImgFile] = useState<File | null>(null)
    const [previewImgUrl, setPreviewImgUrl] = useState<string>("")
    const fileInputRef = useRef(null); // 建立一個 ref 指向 input
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
        const api = isCreate ?
            postApi("product", { ...input, file: imgFile }) :
            putApi("product/" + product.id, { ...input, file: imgFile })
        const { error } = await api
        if (error) {
            return errorHandler(error)
        }
        refresh()
    }
    const handleChangeName = (val: string) => {
        setInput({ ...input, name: val })
    }
    const getImagePreviewUrl = () => {
        if (previewImgUrl) {
            return previewImgUrl
        }
        if (isCreate) {
            return undefined
        }
        return input.img_url
    }
    const handleUploadImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedImageFile = e.target.files?.[0]
        if (!uploadedImageFile) {
            dispatchError('上傳圖片失敗')
            return
        }
        // dispatch(setIsLoading(true))
        const fileReader = new FileReader()
        fileReader.onload = (e) => {
            if (!e.target?.result) {
                // dispatch(setIsLoading(false))
                dispatchError('上傳圖片失敗')
                return
            }
            const tempImageBase64Url = e.target.result as string
            const tempImageDom = new Image()
            tempImageDom.onload = () => {
                const { width } = tempImageDom
                const { height } = tempImageDom
                if (width !== IMG_SIZE.productCard.w ||
                    height !== IMG_SIZE.productCard.h) {
                    // dispatch(setIsLoading(false))
                    dispatchError(`長寬有一不為${IMG_SIZE.color.w}px`)
                    return
                }
                setImgFile(uploadedImageFile)
                setPreviewImgUrl(tempImageBase64Url)
                // dispatch(setIsLoading(false))
            }
            tempImageDom.src = tempImageBase64Url
        };
        fileReader.readAsDataURL(uploadedImageFile);
    }
    const refresh = () => { }
    const handleCancel = () => {

    }
    return (
        <>
            <div className="flex-center">
                <div className="w-1/2 inline-block">
                    <div className="m-2 text-center">
                        <img className="inline-block"
                            style={{ width: 100, height: 150 }}
                            src={getImagePreviewUrl()} />
                        <input
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept=".jpg"
                            type="file"
                            onChange={e => handleUploadImg(e)}
                        />
                    </div>
                </div >
                <div className="w-1/2 inline-block">
                    <div className="w-full">
                        <div className="m-2 flex-center">
                            <div className="inline-block hover:text-amber-600 hover:cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <AddPhotoAlternateIcon style={{ fontSize: 40 }} />
                            </div>
                            <div className="inline-block flex-1 text-center">
                                <div>
                                    {IMG_SIZE.color.w}px x {IMG_SIZE.color.h}px
                                </div>
                                <div className="">jpg file</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                名稱
                            </span>
                            <input className="flex-1 inline-block w-1/2 border ml-2" type="text" name="" id="" />
                        </div></div>
                    <div className=" w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                性別
                            </span>
                            <select className="flex-1 inline-block w-1/2 border ml-2" onChange={(e) => handleGender(e.target.value)} >
                                <option value={FAKE_ID_FOR_CREATE}>no selected</option>
                                {
                                    genders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)
                                }
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            {
                isEditing && <div className="w-full text-center">
                    <div className="btn inline-block mp2" onClick={() => handleSubmit()}>
                        送出
                    </div>
                    <div className="btn inline-block mp2" onClick={() => handleCancel()}>
                        取消
                    </div>
                </div>
            }
            <div style={{ height: 1000 }}></div>
        </>
    )
}