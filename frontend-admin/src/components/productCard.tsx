import { Card } from "@mui/material"
Link
import { ProductCard } from "@/types/product"
import Link from "next/link"


export const AdminProductCardComponent = (props: { productCard: ProductCard }) => {
    const { productCard } = props
    const { id, name, img_url } = productCard
    return <Card sx={{ padding: 1, textAlign: 'center' }}>
        <Link href={`/product/detail/${id}`}>
            <img style={{ width: '100%' }} src={img_url} alt={name} />
            <div>{name}</div>
        </Link>
    </Card>
}