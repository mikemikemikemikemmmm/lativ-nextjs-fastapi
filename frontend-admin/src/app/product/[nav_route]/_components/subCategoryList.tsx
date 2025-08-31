import { ModalContainer } from "@/components/modalContainer"
import { useGetData } from "@/hook/useGetData"
import { useModalMethod } from "@/hook/useModalMethod"
import { CategoryRead, SubCategoryRead } from "@/types/nav"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
import { SubCategoryModal } from "./subCategoryModal"
import Link from "next/link"
import { IconBtnGroup } from "@/components/iconBtn"
import { useRouter } from "next/navigation"

export const SubCategoryList = (props: { navRoute: string, category: CategoryRead }) => {
    const [getSubCategorys, subCategorys] = useGetData<SubCategoryRead>(`sub_category/category_id/${props.category.id}`)
    const handleDelete = (sc: SubCategoryRead) => {
        //TODO
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
    } = useModalMethod({
        id: FAKE_ID_FOR_CREATE,
        name: "",
        route: "",
        category_id: props.category.id
    } as SubCategoryRead, "sub_category", getSubCategorys
    )
    if (subCategorys === "loading") {
        return <div>loading...</div>
    }
    return <>
        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <SubCategoryModal
                    subCategorys={subCategorys}
                    modalProps={modalProps as SubCategoryRead}
                    closeModal={closeModal}
                    refresh={getSubCategorys}
                />
            </ModalContainer>
        }
        <ul className="flex flex-col items-stretch">
            <li className="w-full">
                <button className="btn mp2 w-full" onClick={handleCreate}>
                    新增副種類
                </button>
            </li>

            {
                subCategorys.map(sc => (
                    <li draggable onDrop={() => handleDrop(sc.id)} onDragOver={handleDragOver} className="w-full flex flex-wrap border p-2 m-2" key={sc.id}>
                        <Link
                            className="flex-1 hover:text-blue-500"
                            href={`/product/${props.navRoute}/${props.category.route}/${sc.route}`}>
                            {sc.name}
                        </Link>
                        <div className=" inline-block">
                            <IconBtnGroup
                                onDelete={() => handleDelete(sc)}
                                onEdit={() => handleEdit(sc)}
                                onDragStart={() => handleDragStart(sc.id)}
                            />
                        </div>
                    </li>))
            }
        </ul>
    </>
}