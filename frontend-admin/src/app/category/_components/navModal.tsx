import { useEffect, useRef, useState } from "react"
import { baseFetch} from "@/api/base"
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { NavRead } from "@/types/nav";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useUploadImg } from "@/hook/useUploadImg";
import { getImgUrl } from "@/utils/env";
export const NavModal = (props: {
    modalProps: NavRead,
    navs: NavRead[],
    closeModal: () => void,
    refresh: () => void,
}) => {

    const { modalProps, closeModal, navs, refresh } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<NavRead>({ ...modalProps })
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
            result = false
        }
        if (input.route === '') {
            dispatchError('路由為必須');
            result = false
        }

        if (navs.find(n => n.route === input.route && n.id !== input.id)) {
            dispatchError('路由重複');
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
        formData.append("route", String(input.route));
        formData.append("name", String(input.name));
        const { error } = isCreate ? await baseFetch(`nav`, {
            method: "POST",
            body: formData
        }) : await baseFetch(`nav/${input.id}`, {
            method: "PUT",
            body: formData
        })
        if (error) {
            return errorHandler(error)
        }
        closeModal()
        refresh()
    }
    const handleChange = (val: string, key: keyof typeof modalProps) => {
        setInput({ ...input, [key]: val })
    }
    const { handleUploadImg, imgFile, previewImgUrl, setImgFile, setPreviewImgUrl } = useUploadImg(IMG_SIZE.navBanner)
    const fileInputRef = useRef<HTMLInputElement>(null);
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
    }, [previewImgUrl,isCreate,modalProps.img_file_name])
    const handleCancel = () => {
        setImgFile(null)
        setPreviewImgUrl(null)
        closeModal()
    }
    return (
        <>
            <div className="flex items-start mp2">
                <div className=" inline-block">
                    <div className="m-2 text-center">
                        {
                            imgUrl ?
                                <img className="inline-block"
                                    style={{ width: 505, height: 200 }}
                                    src={imgUrl} 
                                    alt={"nav"}
                                    />
                                :
                                <div className="inline-block border flex-center"
                                    style={{ width: 505, height: 200 }}>
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
                                    {IMG_SIZE.navBanner.w}px寬
                                </div>
                                <div className="">{IMG_SIZE.navBanner.h}px高</div>
                                <div className="">jpg file</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                名稱
                            </span>
                            <input value={input.name} className="flex-1 inline-block w-1/2 border ml-2 px-2" type="text" onChange={e => handleChange(e.target.value, "name")} />
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="m-2 flex">
                            <span className="inline-block">
                                路由
                            </span>
                            <input value={input.route} className="flex-1 inline-block w-1/2 border ml-2 px-2" type="text" onChange={e => handleChange(e.target.value, "route")} />
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