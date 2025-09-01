import { useState } from "react"
import { dispatchError } from "@/store/method";
export const useUploadImg = (imgSize: { w: number, h: number }, maxSizeKB: number = 500) => {
    const [imgFile, setImgFile] = useState<File | null>(null)
    const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(null)
    const handleUploadImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedImageFile = e.target.files?.[0]
        e.target.value = "" // ← 一進來就先清掉
        if (!uploadedImageFile) {
            dispatchError('上傳圖片失敗')
            return
        }
        if (!uploadedImageFile.name.endsWith(".jpg")) {
            dispatchError('僅接受jpg檔案')
            return
        }
        const transToBytes = maxSizeKB * 1024
        if (uploadedImageFile.size > transToBytes) {
            dispatchError(`不得超過${maxSizeKB}KB`)
            return
        }
        const fileReader = new FileReader()
        fileReader.onload = (e) => {
            if (!e.target?.result) {
                dispatchError('上傳圖片失敗')
                return
            }
            const tempImageBase64Url = e.target.result as string
            const tempImageDom = new Image()
            tempImageDom.onload = () => {
                const { width } = tempImageDom
                const { height } = tempImageDom
                let failed = false
                if (width !== imgSize.w) {
                    dispatchError(`寬須為${imgSize.w}px`)
                    failed = true
                }
                if (height !== imgSize.h) {
                    dispatchError(`高須為${imgSize.h}px`)
                    failed = true
                }
                if (failed) {
                    return
                }
                setImgFile(uploadedImageFile)
                setPreviewImgUrl(tempImageBase64Url)
            }
            tempImageDom.src = tempImageBase64Url
        };
        fileReader.readAsDataURL(uploadedImageFile);
    }
    return {
        imgFile, previewImgUrl, handleUploadImg, setPreviewImgUrl, setImgFile
    }
}