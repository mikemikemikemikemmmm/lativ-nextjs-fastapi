'use client'
import { getApi } from "@/api/base";
import { DeleteBtn, EditBtn, SwitchOrderBtn } from "@/components/iconBtn";
import { ModalContainer } from "@/components/modalContainer";
import { NavInput, NavRead } from "@/types/nav";
import { errorHandler } from "@/utils/errorHandler";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NavModal } from "./modal";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { Button } from "@mui/material";
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
    const handleDelete = (n: NavRead) => { }
    const handleSwitchOrder = (n: NavRead) => {

    }
    const closeModal = () => {
        setModalProps(null)
    }
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
            <div className="flex">
                <Button variant="contained" onClick={handleCreate}>新增</Button>
                {
                    navs.map(n => <div
                        draggable
                        // onDragStart={handleDragStart}
                        // onDrop={handleDrop}
                        key={n.id}
                        data-id={n.id}
                    >

                        <Link href={`/product/${n.route}`}>
                            {n.name}
                        </Link>
                        <DeleteBtn onClick={() => handleDelete(n)} />
                        <EditBtn onClick={() => handleEdit(n)} />
                        <SwitchOrderBtn onClick={() => handleSwitchOrder(n)} />
                    </div>)
                }
            </div>
        </>
    );
}
