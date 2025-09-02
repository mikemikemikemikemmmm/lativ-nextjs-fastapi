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
import { useGetData } from "@/hook/useGetData";
import { useCommonMethods } from "@/hook/useCommonMethods";
export default function NavHeader() {
    const [getNavs, navs] = useGetData<NavRead>("nav")
    const { closeModal, handleCreate, handleDelete, handleDragOver, handleDragStart, handleDrop, handleEdit, modalProps, isModalOpen } = useCommonMethods({
        id: FAKE_ID_FOR_CREATE,
        route: "",
        name: "",
        categorys: []
    } as NavRead, "nav", getNavs)
    if (navs === "loading") {
        return null
    }
    return (
        <>
            {isModalOpen &&
                <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                    <NavModal
                        navs={navs}
                        modalProps={modalProps as NavRead}
                        closeModal={closeModal}
                        refresh={getNavs}
                    />
                </ModalContainer>
            }
            <div className="flex p-4">
                <button className="mp2 border hover:cursor-pointer hover:bg-blue-300" onClick={handleCreate}>新增導航</button>
                {
                    navs.map(n => <div
                        className="text-center  mp2 border"
                        draggable
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(n.id)}
                        key={n.id}
                        data-id={n.id}
                    >
                        <Link className="mp2 hover:cursor-pointer hover:text-blue-700" href={`/category/${n.route}`}>
                            {n.name}
                        </Link>
                        <div>
                            <IconBtnGroup
                                onDelete={() => handleDelete(n.id)}
                                onEdit={() => handleEdit(n)}
                                onDragStart={() => handleDragStart(n.id)}
                            />
                        </div>
                    </div>)
                }
            </div>
        </>
    );
}
