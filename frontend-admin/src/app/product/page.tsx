'use client'
import { getApi } from "@/api/base"
import { ProductCard } from "@/components/productCard"
import { ProductCardRead } from "@/types/product"
import { errorHandler } from "@/utils/errorHandler"
import { useEffect, useState } from "react"

export default () => {
    const [searchStr, setSearchStr] = useState("")
    const handleSearch = async () => {
        const api = searchStr === "" ? getApi<ProductCardRead[]>(`product/cards/`) : getApi<ProductCardRead[]>(`product/cards/?product_name=${searchStr}`)
        const { data, error } = await api
        if (error) {
            return errorHandler(error)
        }
        setCards(data)
    }
    const [cards, setCards] = useState<ProductCardRead[]>([])

    useEffect(() => {
        handleSearch()
    }, [])
    return <section>
        <div className="flex-center">
            <span className="my-2 py-2 ml-2 inline-block">
                產品名稱
            </span>
            <input type="text" className="mp2 border" value={searchStr} onChange={e => setSearchStr(e.target.value)} />
            <span className="btn mp2" onClick={handleSearch}>
                搜尋
            </span>
        </div>
        <div>
            {cards.map(c => <div key={c.id} className="w-1/8 inline-block">
                <ProductCard pc={c} />
            </div>)}
        </div>

    </section >
}