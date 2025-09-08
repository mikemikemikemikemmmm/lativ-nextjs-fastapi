'use client'
import { getApi } from "@/api/base"
import { ProductCard } from "@/components/productCard"
import { NavRead, ProductCardRead } from "@/types"
import { getImgUrl } from "@/utils/env"
import { errorHandler } from "@/utils/errorHandler"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { NotFoundUI } from "@/components/notFound"
function NavIndexPage() {
    const { nav_route } = useParams()
    const [nav, setNav] = useState<NavRead| "loading"|"notFound">("loading")
    const getData = async () => {
        const { data, error } = await getApi<NavRead>(`navs/${nav_route}`)
        if (error) {
            setNav("notFound")
            return
        }
        setNav(data)
    }
    useEffect(() => { getData() }, [])

    
    const [cards, setCards] = useState<ProductCardRead[]| "loading">("loading")
    const getCards = async () => {
        const { data, error } = await getApi<ProductCardRead[]>(`products/nav_index?nav_route=${nav_route}`)
        if (error) {
            return errorHandler(error)
        }
        setCards(data)
    }
    useEffect(() => { getCards() }, [nav_route])
    if(nav === "loading"||cards ==="loading"){
        return null
    }
    if(nav === "notFound"){
        return <NotFoundUI/>
    }
    return <section className="w-full">
        <div className="w-full mb-10">
            <Image height={400} width={1010} src={getImgUrl(nav.img_file_name)} alt={nav.name} /></div>
        <div className="grid grid-cols-4 gap-8">
            {
                cards.map(pc => <div key={pc.id}>
                    <ProductCard pc={pc} />
                </div>)
            }
        </div>
    </section >
}
export default NavIndexPage