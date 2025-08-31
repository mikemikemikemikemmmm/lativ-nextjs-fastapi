import { getApi } from "@/api/base"
import { errorHandler } from "@/utils/errorHandler"
import { useEffect, useState } from "react"
import { IconBtnGroup } from "@/components/iconBtn"
import { ProductCardRead } from "@/types/product"
import { FAKE_ID_FOR_CREATE } from "@/utils/constant"
interface Props {
    productId: number
}
export const ProductCard = (props: Props) => {
    const { productId } = props
    const [card, setCard] = useState<ProductCardRead | null>(null)
    const getProductCardData = async () => {
        const { data, error } = await getApi<ProductCardRead>("") //TODO
        if (error) {
            return errorHandler(error)
        }
        setCard(data)
    }
    useEffect(() => { getProductCardData() }, [])
    if (!card) {
        return <div>loading</div>
    }
    return <>

        <div>
            <img src={card.img_url} alt="" />
            <div>{card.name}-{card.gender_name}</div>
        </div>
    </>
}