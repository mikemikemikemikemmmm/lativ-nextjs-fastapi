import { useDispatch } from "react-redux"
import { useState } from "react"
import { setIsLoading } from "../../store/store"
import { Box, Button, IconButton, TextField } from "@mui/material"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { ColorRead } from "@/types/color"
import { postApi, putApi } from "@/api/base"
import { COLOR_IMG_WIDTH, FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { InputWrapper } from "@/utils/inputWrapper";
export const ColorModal = (props: {
    modalProps: ColorRead,
    colorsData: ColorRead[],
    closeModal: () => void,
    // forcedRender: () => void,
}) => {
    const { modalProps, closeModal, colorsData } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const dispatch = useDispatch()
    const [input, setInput] = useState<ColorRead>({ ...modalProps })
    const [imgFile, setImgFile] = useState<File | null>(null)
    const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(null)
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
            result = false
        }
        if (colorsData.find(c => c.name === input.name && input.id !== c.id)) {
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
        const api = isCreate ?
            postApi("colors", { ...input, file: imgFile }) :
            putApi("colors/" + input.id, { ...input, file: imgFile })
        const { error } = await api
        if (error) {
            return errorHandler(error)
        }
        closeModal()
        // forcedRender()
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
                if (width !== COLOR_IMG_WIDTH ||
                    height !== COLOR_IMG_WIDTH) {
                    dispatch(setIsLoading(false))
                    dispatchError(`長寬有一不為${COLOR_IMG_WIDTH}px`)
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
    return (
        <>
            <InputWrapper
                label="名稱"
                value={input.name}
                onChange={val => handleChangeName(val as string)}
            />
            <Box sx={{ margin: 1, padding: 1, display: 'flex', justifyContent: 'center' }}>
                <img
                    style={{
                        width: previewImgUrl ? COLOR_IMG_WIDTH : 0,
                        height: previewImgUrl ? COLOR_IMG_WIDTH : 0
                    }}
                    src={getImagePreviewUrl()} />
                <IconButton color="primary" component="label">
                    <AddPhotoAlternateIcon />
                    <input hidden accept=".jpg" type="file" onChange={e => handleUploadImg(e)} />
                </IconButton>
                <div>上傳圖片 僅限 {COLOR_IMG_WIDTH}px x {COLOR_IMG_WIDTH}px jpg檔案</div>
            </Box>
            <Button size="small" variant="contained" onClick={() => handleSubmit()}>
                送出
            </Button>
        </>
    )
}