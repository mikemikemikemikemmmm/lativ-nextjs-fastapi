'use client'
import { IconBtnGroup } from "@/components/iconBtn";
import { ModalContainer } from "@/components/modalContainer";
import { NavRead } from "@/types/nav";
import Link from "next/link";
import { NavModal } from "./navModal";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { useGetData } from "@/hook/useGetData";
import { useCommonMethods } from "@/hook/useCommonMethods";
import { deleteApi } from "@/api/base";
import { errorHandler } from "@/utils/errorHandler";
import { useParams, useRouter } from "next/navigation";
export default function NavHeader() {
    const { nav_route } = useParams()
    const router = useRouter()
    const [getNavs, navs] = useGetData<NavRead>("nav")
    const handleDelete = async (n: NavRead) => {
        if (!confirm("確定刪除嗎？")) {
            return
        }
        const { error } = await deleteApi(`nav/${n.id}`)
        if (error) {
            return errorHandler(error)
        }
        if (nav_route === n.route) {
            router.push("/category")
        }
        getNavs()

    }
    const { closeModal, handleCreate, handleDragOver, handleDragStart, handleDrop, handleEdit, modalProps, isModalOpen } = useCommonMethods({
        id: FAKE_ID_FOR_CREATE,
        route: "",
        name: "",
        img_file_name: "",
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
                        className="text-center  mp2 border "
                        draggable
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(n.id)}
                        key={n.id}
                        data-id={n.id}
                    >
                        <Link style={{ color: nav_route === n.route ? "red" : "black" }} className="mp2 hover:cursor-pointer hover:text-blue-700" href={`/category/${n.route}`}>
                            {n.name}
                        </Link>
                        <div>
                            <IconBtnGroup
                                onDelete={() => handleDelete(n)}
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
