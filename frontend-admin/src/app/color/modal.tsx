import { useState } from "react"
// import { setIsLoading } from "../../store/store"
import { IconButton } from "@mui/material"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { ColorRead } from "@/types/color"
import { baseFetch} from "@/api/base"
import { IMG_SIZE, FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { useUploadImg } from "@/hook/useUploadImg";
export const ColorModal = (props: {
    modalProps: ColorRead,
    colors: ColorRead[],
    closeModal: () => void,
    refresh: () => void,
}) => {
    const { modalProps, closeModal, colors, refresh } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<ColorRead>({ ...modalProps })
    const { handleUploadImg, previewImgUrl, imgFile } = useUploadImg(IMG_SIZE.color, 5)
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
            result = false
        }
        if (colors.find(c => c.name === input.name && input.id !== c.id)) {
            dispatchError('已有相同名稱的顏色');
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
        formData.append("color_name", input.name); // JSON 轉字串
        const api = isCreate ?
            baseFetch<ColorRead>("color", {
                method: "POST",
                body: formData
            }) :
            baseFetch<ColorRead>(`color/${input.id}`, {
                method: "PUT",
                body: formData
            })
        const { error } = await api
        if (error) {
            return errorHandler(error)
        }
        closeModal()
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
        return modalProps.img_url
    }
    return <div className="p-4">
        <div className="w-full">
            <div className="mp2 text-center">
                <img
                    className="inline-block"
                    style={{
                        width: previewImgUrl ? IMG_SIZE.color.w : 0,
                        height: previewImgUrl ? IMG_SIZE.color.h : 0
                    }}
                    alt={"color"}
                    src={getImagePreviewUrl()} />
                <IconButton color="primary" component="label">
                    <AddPhotoAlternateIcon />
                    <input hidden accept=".jpg" type="file" onChange={e => handleUploadImg(e)} />
                </IconButton>
                <div>僅限 {IMG_SIZE.color.w}px x {IMG_SIZE.color.h}px jpg檔案</div>
            </div>
            <div className="text-center mp2">
                <div className="inline-block">名稱</div>
                <input
                    type="text"
                    className="inline-block ml-2 border p-2 "
                    onChange={e => handleChangeName(e.target.value)}
                    value={input.name} />
            </div>
        </div>
        <div className="text-center">
            <button className="btn mp2 inline-block" onClick={handleSubmit}>送出</button>
        </div>
    </div>
}