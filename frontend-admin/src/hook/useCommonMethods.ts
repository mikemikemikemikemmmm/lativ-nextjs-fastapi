import { errorHandler } from "@/utils/errorHandler"
import { useState } from "react"
import { useDrag } from "./useDrag"
import { deleteApi, putApi } from "@/api/base"
import { dispatchSuccess } from "@/store/method"

export function useCommonMethods<T>(emptyData: T, apiPrefix: string, refresh: () => void) {
    const [modalProps, setModalProps] = useState<T | null>(null)
    const isModalOpen = !!modalProps
    const closeModal = () => {
        setModalProps(null)
    }
    const handleCreate = () => {
        setModalProps({ ...emptyData })
    }
    const handleEdit = (c: T) => {
        setModalProps({ ...c })
    }
    const handleSwitchOrder = async (id1: number, id2: number) => {
        const { error } = await putApi<boolean>(`${apiPrefix}/switch_order/${id1}/${id2}`, {
            method: "PUT"
        })
        if (error) {
            return errorHandler(error)
        }
        dispatchSuccess("交換排序成功")
        refresh()
    }
    const { handleDragStart, handleDragOver, handleDrop } = useDrag((startId: number, endId: number) => {
        handleSwitchOrder(startId, endId)
    })
    const handleDelete = async (id: number) => {
        if (!confirm("確定刪除嗎？")) {
            return
        }
        const { error } = await deleteApi(`${apiPrefix}/${id}`)
        if (error) {
            return errorHandler(error)
        }
        refresh()
    }
    return {
        modalProps, isModalOpen, handleDelete, closeModal, handleCreate, handleDragOver, handleDragStart, handleDrop, handleEdit
    }
}