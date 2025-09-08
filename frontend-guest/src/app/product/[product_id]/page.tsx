'use client'
import { getApi } from "@/api/base"
import { ProductClient } from "./client"
import { ProductDetailRead } from "@/types"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { errorHandler } from "@/utils/errorHandler"
function ProductPage() {
    const { product_id } = useParams()
    const [pd, setPd] = useState<ProductDetailRead | "loading">("loading")
    const getPd = async () => {
        const { data, error } = await getApi<ProductDetailRead>(`products?product_id=${product_id}`)
        if (error) {
            return errorHandler(error)
        }
        setPd(data)
    }
    useEffect(() => { getPd() }, [product_id])
    if (pd === 'loading') {
        return null
    }
    return <ProductClient product={pd} />
}

export default ProductPage