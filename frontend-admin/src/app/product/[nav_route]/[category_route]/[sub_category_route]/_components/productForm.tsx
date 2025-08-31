import { postApi, putApi } from "@/api/base"
import { useGetData } from "@/hook/useGetData"
import { dispatchError } from "@/store/method"
import { GenderRead } from "@/types/gender"
import { ProductModalRead } from "@/types/product"
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant"
import { errorHandler } from "@/utils/errorHandler"
import { IconButton } from "@mui/material"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useState } from "react"

interface Props {
    isEditing: boolean
    product: ProductModalRead
    seriesId: number
}
export const ProductModalForm = (props: Props) => {
    const { isEditing, product, seriesId, } = props
    const isCreate = product.id === FAKE_ID_FOR_CREATE
    const [getGenders, genders] = useGetData<GenderRead>("gender")
    const [input, setInput] = useState<{ name: string, gender_id: number, img_url: string }>({
        name: product.name,
        gender_id: product.gender_id,
        img_url: ""
    })
    const [imgFile, setImgFile] = useState<File | null>(null)
    const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(null)
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
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
        dispatch(setIsLoading(true))
        const fileReader = new FileReader()
        fileReader.onload = (e) => {
            if (!e.target?.result) {
                dispatch(setIsLoading(false))
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
                dispatch(setIsLoading(false))
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
            <div>
                <span>
                    名稱
                </span>
                <input type="text" name="" id="" />
            </div>
            <div>
                <span>
                    性別
                </span>
                <input type="text" name="" id="" />
            </div>
            <div className="flex-center mp2">
                <img
                    style={{
                        width: previewImgUrl ? IMG_SIZE.productCard.w : 0,
                        height: previewImgUrl ? IMG_SIZE.productCard.h : 0
                    }}
                    src={getImagePreviewUrl()} />
                <IconButton color="primary" component="label">
                    <AddPhotoAlternateIcon />
                    <input hidden accept=".jpg" type="file" onChange={e => handleUploadImg(e)} />
                </IconButton>
                <div>上傳圖片 僅限 {IMG_SIZE.color.w}px x {IMG_SIZE.color.h}px jpg檔案</div>
            </div >
            <div className="btn mp2" onClick={() => handleSubmit()}>
                送出
            </div>
            <div className="btn mp2" onClick={() => handleCancel()}>
                取消
            </div>
        </>
    )
}