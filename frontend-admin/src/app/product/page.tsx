'use client'
import { getApi } from "@/api/base"
import { ProductCard } from "@/components/productCard"
import { ProductCardRead } from "@/types/product"
import { errorHandler } from "@/utils/errorHandler"
import { useEffect, useState } from "react"

export default () => {
    const [searchStr, setSearchStr] = useState("")
    const handleSearch = async (query: string) => {
        const api = query === "" ? getApi<ProductCardRead[]>(`product_card/`) : getApi<ProductCardRead[]>(`product_card/?product_name=${query}`)
        const { data, error } = await api
        if (error) {
            return errorHandler(error)
        }
        setCards(data)
    }
    const [cards, setCards] = useState<ProductCardRead[]>([])

    useEffect(() => {
        handleSearch("")
    }, [])
    return <section>
        <div className="flex-center">
            <span className="my-2 py-2 ml-2 inline-block">
                產品名稱
            </span>
            <input type="text" className="mp2 border" value={searchStr} onChange={e => setSearchStr(e.target.value)} />
            <button className="btn mp2" onClick={() => handleSearch(searchStr)}>
                搜尋
            </button>
            <button className="btn mp2" onClick={() => handleSearch("")}>
                取消搜尋結果
            </button>
        </div>
        <div className="text-center">
            {cards.length === 0 &&
                <div className="inline-block border mp2">
                    無產品
                </div>
            }
            {cards.map(c => <div key={c.id} className="w-1/8 inline-block">
                <ProductCard pc={c} />
            </div>)}
        </div>

    </section >
}