import { useState } from "react"
import { Button, Stack } from "@mui/material"
import { postApi, putApi } from "@/api/base"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { InputWrapper } from "@/components/inputWrapper";
import { SubCategoryRead } from "@/types/nav";
export const SubCategoryModal = (props: {
    modalProps: SubCategoryRead,
    subCategorys: SubCategoryRead[],
    closeModal: () => void,
    refresh: () => void,
}) => {
    const { modalProps, closeModal, subCategorys, refresh } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<SubCategoryRead>({ ...modalProps })
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

        if (subCategorys.find(sc => sc.category_id === modalProps.category_id &&
            sc.route === input.route &&
            sc.id !== input.id)
        ) {
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
            postApi("sub_category", { ...input }) :
            putApi("sub_category/" + input.id, { ...input })
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
            <InputWrapper
                sx={{ m: 2 }}
                label="路由"
                value={input.route}
                onChange={val => handleChange(val, "route")}
            />

            <Button sx={{ m: 2 }} size="small" variant="contained" onClick={() => handleSubmit()}>
                送出
            </Button>
        </Stack>
    )
}