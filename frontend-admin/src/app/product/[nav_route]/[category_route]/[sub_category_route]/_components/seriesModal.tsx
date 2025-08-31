import { useState } from "react"
import { Button, Stack } from "@mui/material"
import { postApi, putApi } from "@/api/base"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { InputWrapper } from "@/components/inputWrapper";
import { SeriesRead } from "@/types/series";
export const SeriesModal = (props: {
    modalProps: SeriesRead,
    closeModal: () => void,
    refresh: () => void,
    subCategoryId:number
}) => {
    const { modalProps, closeModal, refresh,subCategoryId } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<SeriesRead>({ ...modalProps,sub_category_id:subCategoryId })
    const isInputPass = () => {
        let result = true
        if (input.name === '') {
            dispatchError('名稱為必須');
            result = false
        }
        return result;
    }
    const handleSubmit = async () => {
        if (!isInputPass()) {
            return
        }
        const api = isCreate ?
            postApi("series", { ...input }) :
            putApi("series/" + input.id, { ...input })
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
                sx={{ m: 2 }}
                label="名稱"
                value={input.name}
                onChange={val => handleChange(val, "name")}
            />

            <Button sx={{ m: 2 }} size="small" variant="contained" onClick={() => handleSubmit()}>
                送出
            </Button>
        </Stack>
    )
}