import { deleteApi } from "@/api/base";
import { NavInput } from "@/types/nav";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { adminErrorHandler } from "@/utils/errorHandler";
import { useState } from "react";
import { ModalContainer } from "../modalContainer";
import { NavModal } from "./navModel";
const emptyNav = {
    id: FAKE_ID_FOR_CREATE,
    name: "",
    route: "",
}
export const ProductNav = (props: { navs: NavInput[] }) => {
    const { navs } = props
    const [modalProps, setModalProps] = useState<NavInput | undefined>(undefined)
    const isModalOpen = !!modalProps
    const handleEdit = (nav: NavInput) => {
        setModalProps({ ...nav })
    }
    const handleCreate = () => {
        setModalProps({ ...emptyNav })
    }
    const handleDelete = async (n: NavInput) => {
        if (!confirm(`確定刪除"${n.name}"?`)) {
            return
        }
        const { error } = await deleteApi("navs/" + n.id)
        if (error) {
            return adminErrorHandler(error)
        }
    }
    const closeModal = () => {
        setModalProps(undefined)
    }

    return <>

        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <NavModal
                    navs={navs}
                    modalProps={modalProps}
                    closeModal={closeModal}
                />
            </ModalContainer>
        }
        <nav className="flex">
            <div>
                <button onClick={handleCreate}>新增</button>
            </div>
            {
                navs.map(n =>
                    <div key={n.name}>
                        <div>
                            {n.name}
                        </div>
                        <button>修改</button>
                        <button>刪除</button>
                    </div>)
            }
        </nav></>
}