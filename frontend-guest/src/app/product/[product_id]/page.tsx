'use client'
import { getApi } from "@/api/base"
import { ProductClient } from "./client"
import { ProductDetailRead } from "@/types"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { errorHandler } from "@/utils/errorHandler"
import { NotFoundUI } from "@/components/notFound"
function ProductPage() {
    const { product_id } = useParams()
    const [pd, setPd] = useState<ProductDetailRead | "loading"|"notFound">("loading")
    const getPd = async () => {
        const { data, error } = await getApi<ProductDetailRead[]>(`products?product_id=${product_id}`)
        if (error) {
            setPd("notFound")
            return
        }
        setPd(data[0])
    }
    useEffect(() => { getPd() }, [product_id])
    if (pd === 'loading') {
        return null
    }
    if(pd === "notFound"){
        return <NotFoundUI/>
    }
    return <ProductClient product={pd} />
}

export default ProductPage