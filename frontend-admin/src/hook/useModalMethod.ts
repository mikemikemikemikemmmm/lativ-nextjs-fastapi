import { errorHandler } from "@/utils/errorHandler"
import { useState } from "react"
import { useDrag } from "./useDrag"
import { putApi } from "@/api/base"

export function useModalMethod<T>(emptyData: T, switchOrderApiPrefix: string, refresh: () => void) {
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
        const { error } = await putApi<boolean>(`${switchOrderApiPrefix}/switch_order/${id1}/${id2}`, {
            method: "PUT"
        })
        if (error) {
            return errorHandler(error)
        }
        refresh()
    }
    const { handleDragStart, handleDragOver, handleDrop } = useDrag((startId: number, endId: number) => {
        handleSwitchOrder(startId, endId)
    })
    return {
        modalProps, isModalOpen, closeModal, handleCreate, handleDragOver, handleDragStart, handleDrop, handleEdit
    }
}