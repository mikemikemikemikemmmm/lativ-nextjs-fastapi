import { useDispatch } from "react-redux"
import { useState } from "react"
import { dispatchError } from "../../utils/errorHandler"
import { setIsLoading } from "../../store/store"
import { Box, Button, IconButton, TextField } from "@mui/material"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { FieldWrapper } from "../../component/fieldWrapper"
import { ColorRead } from "@/types/color"
import { postApi, putApi } from "@/api/base"
import { adminErrorHandler } from "@/utils/errorHandler"
import { COLOR_IMG_WIDTH, FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { NavInput } from "@/types/nav"
export const NavModal = (props: {
    modalProps: NavInput,
    navs: NavInput[],
    closeModal: () => void,
    // forcedRender: () => void,
}) => {
    const { modalProps, closeModal, navs } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const dispatch = useDispatch()
    const [input, setInput] = useState<NavInput>({ ...modalProps })
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
            result = false
        }
        if (navs.find(n => n.route === input.name && input.id !== n.id)) {
            dispatchError('已有相同路由的導航');
            result = false
        }
        return result;
    }
    const handleSubmit = async () => {
        if (!isInputPass()) {
            return
        }
        const api = isCreate ?
            postApi("navs", { ...input }) :
            putApi("navs/" + input.id, { ...input })
        const { error } = await api
        if (error) {
            return adminErrorHandler(error)
        }
        closeModal()
        // forcedRender()
    }
    const handleChangeName = (val: string) => {
        setInput({ ...input, name: val })
    }
    return (
        <>
            <FieldWrapper
                label="名稱"
                value={input.name}
                onChange={val => handleChangeName(val)}
            />
            <Button size="small" variant="contained" onClick={() => handleSubmit()}>
                送出
            </Button>
        </>
    )
}