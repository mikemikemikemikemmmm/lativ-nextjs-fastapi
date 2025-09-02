




// import { useState } from "react"
// import { Button, Stack } from "@mui/material"
// import { postApi, putApi } from "@/api/base"
// import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
// import { dispatchError } from "@/store/method";
// import { errorHandler } from "@/utils/errorHandler";
// import { InputWrapper } from "@/utils/inputWrapper";
// import { CategoryRead } from "@/types/nav";
// import { useModal } from "@/hook/useModal";
// export const CategoryModal = (props: {
//     modalProps: CategoryRead,
//     categorys: CategoryRead[],
//     closeModal: () => void,
//     refresh: () => void,
// }) => {
//     const {modalProps,categorys,closeModal,refresh}=props
//     const = useModal(modalProps,categorys,)
//     return <div></div>
// }

import { useState } from "react"
import { Button, Stack } from "@mui/material"
import { postApi, putApi } from "@/api/base"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { dispatchError } from "@/store/method";
import { errorHandler } from "@/utils/errorHandler";
import { CategoryRead } from "@/types/nav";
import { InputWrapper } from "@/components/inputWrapper";
export const CategoryModal = (props: {
    modalProps: CategoryRead,
    categorys: CategoryRead[],
    closeModal: () => void,
    refresh: () => void,
}) => {
    const { modalProps, closeModal, categorys, refresh } = props
    const isCreate = modalProps.id === FAKE_ID_FOR_CREATE
    const [input, setInput] = useState<CategoryRead>({ ...modalProps })
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

        if (categorys.find(c => c.nav_id === modalProps.nav_id &&
            c.route === input.route &&
            c.id !== input.id)
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
            postApi("category", { ...input }) :
            putApi("category/" + input.id, { ...input })
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