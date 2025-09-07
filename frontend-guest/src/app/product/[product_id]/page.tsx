import { getApi } from "@/api/base"
import { ProductClient } from "./client"
import { ProductDetailRead } from "@/types"

async function ProductPage({
    params
}: {
    params: { product_id: string }
}) {
    const { product_id } = await params
    const { data, error } = await getApi<ProductDetailRead>(`products?product_id=${product_id}`)
    if (error) {
        return null
    }
    return <ProductClient product={data} />
}

export default ProductPage