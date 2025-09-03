'use client'
import { CategoryRead, NavRead } from "@/types/nav"
import { SubCategoryList } from "./subCategoryList"
import { ModalContainer } from "@/components/modalContainer"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { CategoryModal } from "./categoryModal"
import { useGetData } from "@/hook/useGetData"
import { IconBtnGroup } from "@/components/iconBtn"
import { deleteApi } from "@/api/base"
import { errorHandler } from "@/utils/errorHandler"
import { useCommonMethods } from "@/hook/useCommonMethods"
import { useParams, useRouter } from "next/navigation"
export const CategoryAside = (props: { nav: NavRead }) => {
    const { category_route, nav_route } = useParams()
    const router = useRouter()
    const [getCategorys, categorys] = useGetData<CategoryRead>(`category/nav_id/${props.nav.id}`)
    const handleDelete = async (c: CategoryRead) => {
        if (!confirm("確定刪除嗎？")) {
            return
        }
        const { error } = await deleteApi(`category/${c.id}`)
        if (error) {
            return errorHandler(error)
        }
        if (c.route === category_route) {
            router.push(`/category/${nav_route}`)
        }
        getCategorys()

    }
    const {
        handleCreate,
        handleDragOver,
        handleDragStart,
        handleDrop,
        handleEdit,
        closeModal,
        modalProps,
        isModalOpen
    } = useCommonMethods({
        id: FAKE_ID_FOR_CREATE,
        name: "",
        route: "",
        sub_categorys: [],
        nav_id: props.nav.id
    } as CategoryRead, "category", getCategorys
    )
    if (categorys === "loading") {
        return null
    }
    return <>
        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <CategoryModal
                    categorys={categorys}
                    modalProps={modalProps as CategoryRead}
                    closeModal={closeModal}
                    refresh={getCategorys}
                />
            </ModalContainer>
        }
        <aside>
            <ul className="flex flex-col items-stretch">
                <li className="w-full">
                    <button className="btn mp2 w-full" onClick={handleCreate}>
                        新增種類
                    </button>
                </li>
                {
                    categorys.map(c => <li key={c.id}>
                        <div className="border mp2 flex flex-wrap w-full"
                            draggable
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(c.id)}>
                            {c.name}
                            <div className="inline-block ml-auto">
                                <IconBtnGroup
                                    onDelete={() => handleDelete(c)}
                                    onEdit={() => handleEdit(c)}
                                    onDragStart={() => handleDragStart(c.id)}
                                />
                            </div>
                        </div>
                        <div className="ml-10">
                            <SubCategoryList navRoute={props.nav.route} category={c} />
                        </div>
                    </li>)
                }
            </ul>
        </aside>
    </>
}