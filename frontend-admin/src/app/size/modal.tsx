import { useDispatch } from "react-redux"
import { useState } from "react"
import { setIsLoading } from "../../store/store"
import { Box, Button, IconButton, Stack, TextField } from "@mui/material"
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { ColorRead } from "@/types/color"
import { postApi, putApi } from "@/api/base"
import { COLOR_IMG_WIDTH, FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { InputWrapper } from "@/utils/inputWrapper";
import { SizeRead } from "@/types/size";
export const SizeModal = (props: {
    modalProps: SizeRead,
    sizes: SizeRead[],
    closeModal: () => void,
    refresh: () => void,
}) => {
    const { modalProps, closeModal, sizes, refresh } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<SizeRead>({ ...modalProps })
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
            result = false
        }
        if (sizes.find(s => s.name === input.name && input.id !== s.id)) {
            dispatchError('已有相同名稱');
            result = false
        }
        return result;
    }
    const handleSubmit = async () => {
        if (!isInputPass()) {
            return
        }
        const api = isCreate ?
            postApi("size", { ...input }) :
            putApi("size/" + input.id, { ...input })
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
    return (
        <Stack>
            <InputWrapper
                sx={{m:2}}
                label="名稱"
                value={input.name}
                onChange={val => handleChangeName(val as string)}
            />
            <Button   sx={{m:2}} size="small" variant="contained" onClick={() => handleSubmit()}>
                送出
            </Button>
        </Stack>
    )
}