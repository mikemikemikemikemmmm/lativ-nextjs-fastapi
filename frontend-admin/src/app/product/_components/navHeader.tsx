'use client'
import { getApi, putApi } from "@/api/base";
import { IconBtnGroup } from "@/components/iconBtn";
import { ModalContainer } from "@/components/modalContainer";
import { NavRead } from "@/types/nav";
import { errorHandler } from "@/utils/errorHandler";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NavModal } from "./navModal";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { useDrag } from "@/hook/useDrag";
export default function NavHeader() {

    const [navs, setNavs] = useState<NavRead[]>([])
    const getAllNavs = async () => {
        const { data, error } = await getApi<NavRead[]>("nav")
        if (error) {
            return errorHandler(error)
        }
        setNavs(data)
    }
    useEffect(() => {
        getAllNavs()
    }, [])
    const [modalProps, setModalProps] = useState<NavRead | null>(null)
    const isModalOpen = !!modalProps
    const handleCreate = () => {
        setModalProps({
            id: FAKE_ID_FOR_CREATE,
            route: "",
            name: "",
            categorys: []
        })
    }
    const handleEdit = (n: NavRead) => {
        setModalProps({ ...n })
    }
    const handleDelete = (n: NavRead) => {
        //TODO
    }
    const handleSwitchOrder = async (id1: number, id2: number) => {
        const { error } = await putApi<boolean>(`nav/switch_order/${id1}/${id2}`, {
            method: "PUT"
        })
        if (error) {
            return errorHandler(error)
        }
        getAllNavs()
    }
    const closeModal = () => {
        setModalProps(null)
    }
    const { handleDragStart, handleDragOver, handleDrop } = useDrag((startId: number, endId: number) => {
        handleSwitchOrder(startId, endId)
    })
    return (
        <>
            {isModalOpen &&
                <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                    <NavModal
                        navs={navs}
                        modalProps={modalProps}
                        closeModal={closeModal}
                        refresh={getAllNavs}
                    />
                </ModalContainer>
            }
            <div className="flex p-4">
                <button className="mp2 border hover:cursor-pointer hover:bg-blue-300" onClick={handleCreate}>新增</button>
                {
                    navs.map(n => <div
                        className="text-center  mp2 border"
                        draggable
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(n.id)}
                        key={n.id}
                        data-id={n.id}
                    >
                        <Link className="mp2 hover:cursor-pointer hover:text-blue-700" href={`/product/${n.route}`}>
                            {n.name}
                        </Link>
                        <div>
                            <IconBtnGroup
                                onDelete={() => handleDelete(n)}
                                onEdit={() => handleEdit(n)}
                                onSwitchOrder={() => handleDragStart(n.id)}
                            />
                        </div>
                    </div>)
                }
            </div>
        </>
    );
}
