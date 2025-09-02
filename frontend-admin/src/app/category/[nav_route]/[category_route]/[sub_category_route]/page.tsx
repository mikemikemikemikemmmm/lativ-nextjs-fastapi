'use client'
import { deleteApi, getApi } from "@/api/base";
import { IconBtnGroup } from "@/components/iconBtn";
import { ModalContainer } from "@/components/modalContainer";
import { useCommonMethods } from "@/hook/useCommonMethods";
import { SubCategoryRead } from "@/types/nav";
import { SeriesRead } from "@/types/series";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { errorHandler } from "@/utils/errorHandler";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SeriesModal } from "./_components/seriesModal";
import { ProductCardContainer } from "./_components/productCardsContainer";
import { dispatchSuccess } from "@/store/method";

export default () => {
    const params = useParams();
    const { nav_route, category_route, sub_category_route } = params
    const [subCategory, setSubCategory] = useState<SubCategoryRead | "loading" | "noSubcategory">("loading")
    const getSubCategoryByRoute = async () => {
        const { data, error } = await getApi<SubCategoryRead>(
            `sub_category/routes/${nav_route}/${category_route}/${sub_category_route}`
        )
        if (error) {
            setSubCategory("noSubcategory")
            return errorHandler(error)
        }
        setSubCategory(data)
    }
    useEffect(() => {
        getSubCategoryByRoute()
    }, [nav_route])
    // ----------------------------
    const [series, setSeries] = useState<SeriesRead[]>([])
    const getSeries = async () => {
        const { data, error } = await getApi<SeriesRead[]>(`series/sub_category_id/${(subCategory as SubCategoryRead).id}`)
        if (error) {
            return errorHandler(error)
        }
        setSeries(data)
    }
    useEffect(() => {
        if (subCategory === "loading" || subCategory === "noSubcategory") {
            return
        }
        getSeries()
    }, [subCategory])
    // ----------------------------
    const { isModalOpen, modalProps, closeModal, handleCreate, handleDragOver, handleDragStart, handleDrop, handleEdit } = useCommonMethods({
        id: FAKE_ID_FOR_CREATE,
        name: "",
        sub_category_id: FAKE_ID_FOR_CREATE
    } as SeriesRead, "series", getSeries)
    const handleDelete = async (s: SeriesRead) => {
        const { error } = await deleteApi(`series/${s.id}`)
        if (error) {
            return errorHandler(error)
        }
        getSeries()
    }
    if (subCategory === "loading") {
        return null
    }
    if (subCategory === "noSubcategory") {
        return <div>no category</div>
    }
    return <>
        {isModalOpen &&
            <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
                <SeriesModal
                    modalProps={modalProps as SeriesRead}
                    closeModal={closeModal}
                    refresh={getSeries}
                    subCategoryId={subCategory.id}
                />
            </ModalContainer>
        }
        <section>
            <div>
                <button className="btn mp2" onClick={handleCreate}>新增系列</button>
            </div>
            {
                series.map(s => (
                    <div
                        className="mp2 border"
                        key={s.id}>
                        <div className="flex">
                            <div
                                draggable
                                onDrop={() => handleDrop(s.id)}
                                onDragOver={handleDragOver}
                                className="flex-1">
                                {s.name}
                            </div>
                            <div className="ml-auto">
                                <IconBtnGroup
                                    onDelete={() => handleDelete(s)}
                                    onEdit={() => handleEdit(s)}
                                    onDragStart={() => handleDragStart(s.id)}
                                />
                            </div>
                        </div>
                        <ProductCardContainer seriesId={s.id} />
                    </div>
                ))
            }
        </section >
    </>
}