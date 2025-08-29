import { CategoryRead, SubCategoryRead } from "@/types/nav"

export const SubCategoryList = (props: { subCategorys: SubCategoryRead[] }) => {
    const { subCategorys } = props
    const handleCreate = () => { }
    const handleDelete = (sc: SubCategoryRead) => { }
    const handleEdit = (sc: SubCategoryRead) => { }
    const handleSwitchOrder = (sc: SubCategoryRead) => { }
    return <>
        <li>
            <button onClick={handleCreate}>
                新增副種類
            </button>
        </li>
        {
            subCategorys.map(sc => (
                <li key={sc.id}>
                    {sc.name}
                    <button onClick={() => handleEdit(sc)}>修改</button>
                    <button onClick={() => handleDelete(sc)}>刪除</button>
                </li>))
        }
    </>
}