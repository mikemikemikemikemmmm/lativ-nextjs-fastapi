import { CategoryRead, SubCategoryRead } from "@/types/nav"

export const ProductAside = (props: { categorys: CategoryRead[] }) => {
    const { categorys } = props
    const handleCreateCategory = () => { }
    const handleDeleteCategory = (c: CategoryRead) => { }
    const handleEditCategory = (c: CategoryRead) => { }
    
    const handleCreateSubCategory = () => { }
    const handleDeleteSubCategory = (sc: SubCategoryRead) => { }
    const handleEditSubCategory = (sc: SubCategoryRead) => { }
    return <aside>
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
                <li>
                    <button onClick={handleCreateSubCategory}>
                        新增副種類
                    </button>
                </li>
                {
                    c.sub_categorys.map(sc => (
                        <li key={sc.id}>
                            {sc.name}
                            <button onClick={() => handleEditSubCategory(sc)}>修改</button>
                            <button onClick={() => handleDeleteSubCategory(sc)}>刪除</button>
                        </li>))
                }
            </ul>)
        }
    </aside>
}