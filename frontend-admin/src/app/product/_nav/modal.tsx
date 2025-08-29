import { useState } from "react"
import { Button, Stack } from "@mui/material"
import { postApi, putApi } from "@/api/base"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { InputWrapper } from "@/utils/inputWrapper";
import { NavRead } from "@/types/nav";
import { useAppStore } from "@/store/hook";
export const NavModal = (props: {
    modalProps: NavRead,
    navs: NavRead[],
    closeModal: () => void,
    refresh: () => void,
}) => {
    const store =useAppStore()
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
        return result;
    }
    const handleSubmit = async () => {
        if (!isInputPass()) {
            return
        }
        const api = isCreate ?
            postApi("nav", { ...input }) :
            putApi("nav/" + input.id, { ...input })
        const { error } = await api
        if (error) {
            return errorHandler(error)
        }
        closeModal()
        refresh()
    }
    const handleChange = (val: string, key: keyof typeof modalProps) => {
        setInput({ ...input, [key]: val })
    }
    return (
        <Stack>
            <InputWrapper
                sx={{m:2}}
                label="名稱"
                value={input.name}
                onChange={val => handleChange(val, "name")}
            />
            <InputWrapper
                sx={{m:2}}
                label="路由"
                value={input.route}
                onChange={val => handleChange(val, "route")}
            />

            <Button sx={{m:2}} size="small" variant="contained" onClick={() => handleSubmit()}>
                送出
            </Button>
        </Stack>
    )
}