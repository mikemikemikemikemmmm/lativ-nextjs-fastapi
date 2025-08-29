import { CategoryRead, SubCategoryRead } from "@/types/nav"
import { SubCategoryList } from "../_subCategory/subCategoryList"
import { useEffect, useState } from "react"
import { getApi } from "@/api/base"
import { errorHandler } from "@/utils/errorHandler"
import { ModalContainer } from "@/components/modalContainer"
import { CategoryModal } from "./categoryModal"

export const CategoryAside = () => {
    const [categorys, setCategorys] = useState<CategoryRead[]>([])
    const getAllCategorys = async () => {
        const { data, error } = await getApi<CategoryRead[]>(`categorys/?nav_route=${}`)
        if (error) {
            return errorHandler(error)
        }
        setCategorys(data)
    }
    useEffect(() => {
        getAllCategorys()
    }, [])


    const [modalProps, setModalProps] = useState<CategoryRead | null>(null)
    const isModalOpen = !!modalProps
    const closeModal = () => {
        setModalProps(null)
    }
    const handleCreateCategory = () => { }
    const handleDeleteCategory = (c: CategoryRead) => { }
    const handleEditCategory = (c: CategoryRead) => { }
    return <>
        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <CategoryModal
                    navs={navs}
                    modalProps={modalProps}
                    closeModal={closeModal}
                    refresh={getAllNavs}
                />
            </ModalContainer>
        }
        <aside>
            <ul>
                <li>
                    <button onClick={handleCreateCategory}>
                        新增種類
                    </button>
                </li>
            </ul>
            {
                categorys.map(c => <ul key={c.id}>
                    <li>{c.name}
                        <button onClick={() => handleEditCategory(c)}>修改</button>
                        <button onClick={() => handleDeleteCategory(c)}>刪除</button>
                    </li>
                    <SubCategoryList subCategorys={c.sub_categorys} />
                </ul>)
            }
        </aside>
    </>
}