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
import { NavRead } from "@/types/nav";
export const NavModal = (props: {
    modalProps: NavRead,
    navs: NavRead[],
    closeModal: () => void,
    reRender: () => void,
}) => {
    const { modalProps, closeModal, navs, reRender } = props
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
        return result;
    }
    const handleSubmit = async () => {
        if (!isInputPass()) {
            return
        }
        const api = isCreate ?
            postApi("colors", { ...input }) :
            putApi("colors/" + input.id, { ...input })
        const { error } = await api
        if (error) {
            return errorHandler(error)
        }
        closeModal()
        reRender()
    }
    const handleChange = (val: string, key: keyof typeof modalProps) => {
        setInput({ ...input, [key]: val })
    }
    return (
        <>
            <InputWrapper
                label="名稱"
                value={input.name}
                onChange={val => handleChange(val, "name")}
            />
            <InputWrapper
                label="路由"
                value={input.route}
                onChange={val => handleChange(val, "route")}
            />

            <Button size="small" variant="contained" onClick={() => handleSubmit()}>
                送出
            </Button>
        </>
    )
}