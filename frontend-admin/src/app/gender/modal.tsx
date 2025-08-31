import { useState } from "react"
import { Button, Stack } from "@mui/material"
import { postApi, putApi } from "@/api/base"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { GenderRead } from "@/types/gender";
import { InputWrapper } from "@/components/inputWrapper";
export const GenderModal = (props: {
    modalProps: GenderRead,
    genders: GenderRead[],
    closeModal: () => void,
    refresh: () => void,
}) => {
    const { modalProps, closeModal, genders, refresh } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<GenderRead>({ ...modalProps })
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
            result = false
        }
        if (genders.find(g => g.name === input.name && input.id !== g.id)) {
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
            postApi("gender", { ...input }) :
            putApi("gender/" + input.id, { ...input })
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
                sx={{ m: 2 }}
                label="名稱"
                value={input.name}
                onChange={val => handleChangeName(val as string)}
            />
            <Button sx={{ m: 2 }} size="small" variant="contained" onClick={() => handleSubmit()}>
                送出
            </Button>
        </Stack>
    )
}