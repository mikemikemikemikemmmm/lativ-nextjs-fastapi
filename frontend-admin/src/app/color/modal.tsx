import { useDispatch } from "react-redux"
import { useState } from "react"
// import { setIsLoading } from "../../store/store"
import { Box, Button, IconButton, TextField } from "@mui/material"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { ColorRead } from "@/types/color"
import { baseFetch, postApi, putApi } from "@/api/base"
import { IMG_SIZE, FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { InputWrapper } from "@/components/inputWrapper";
export const ColorModal = (props: {
    modalProps: ColorRead,
    colors: ColorRead[],
    closeModal: () => void,
    refresh: () => void,
}) => {
    const dispatch = useDispatch()
    const { modalProps, closeModal, colors, refresh } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<ColorRead>({ ...modalProps })
    const [imgFile, setImgFile] = useState<File | null>(null)
    const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(null)
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
    const handleUploadImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedImageFile = e.target.files?.[0]
        if (!uploadedImageFile) {
            dispatchError('上傳圖片失敗')
            return
        }
        if (!uploadedImageFile.name.endsWith(".jpg")) {
            dispatchError('僅接受jpg檔案')
            return
        }
        const maxSize = 1024 * 5 //5kb
        if (uploadedImageFile.size > maxSize) {
            dispatchError('不得超過5kb')
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
                let failed = false
                if (width !== IMG_SIZE.color.w) {
                    // dispatch(setIsLoading(false))
                    dispatchError(`寬須為${IMG_SIZE.color.w}px`)
                    failed = true
                }
                if (height !== IMG_SIZE.color.h) {
                    // dispatch(setIsLoading(false))
                    dispatchError(`高須為${IMG_SIZE.color.h}px`)
                    failed = true
                }
                if (failed) {
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
    return <div className="p-4">
        <div className="w-full">
            <div className="mp2 text-center">
                <img
                    className="inline-block"
                    style={{
                        width: previewImgUrl ? IMG_SIZE.color.w : 0,
                        height: previewImgUrl ? IMG_SIZE.color.h : 0
                    }}
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
            <div className="btn mp2 inline-block" onClick={handleSubmit}>送出</div>
        </div>
    </div>
    // return (
    //     <>
    //         <InputWrapper
    //             label="名稱"
    //             value={input.name}
    //             onChange={val => handleChangeName(val as string)}
    //         />
    //         <Box sx={{ margin: 1, padding: 1, display: 'flex', justifyContent: 'center' }}>
    //             <img
    //                 style={{
    //                     width: previewImgUrl ?  IMG_SIZE.color.w : 0,
    //                     height: previewImgUrl ?  IMG_SIZE.color.h : 0
    //                 }}
    //                 src={getImagePreviewUrl()} />
    //             <IconButton color="primary" component="label">
    //                 <AddPhotoAlternateIcon />
    //                 <input hidden accept=".jpg" type="file" onChange={e => handleUploadImg(e)} />
    //             </IconButton>
    //             <div>上傳圖片 僅限 { IMG_SIZE.color.w}px x { IMG_SIZE.color.h}px jpg檔案</div>
    //         </Box>
    //         <Button size="small" variant="contained" onClick={() => handleSubmit()}>
    //             送出
    //         </Button>
    //     </>
    // )
}