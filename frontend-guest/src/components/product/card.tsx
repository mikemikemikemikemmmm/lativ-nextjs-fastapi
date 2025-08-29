import { ProductCard } from "@/types/product";
import Link from "next/link";
export const ProductCardComponent = (props: { cardData: ProductCard }) => {
    const { cardData } = props
    return <div>
        <img src={cardData.img_url} alt={cardData.name} />
        <div>
            {cardData.sub_products.map(sp => <Link key={sp.id} href={ }>
                <img src={sp.color_img_url} alt={sp.color_name} />
            </Link>)}
        </div>
        <div>
            {`${cardData.name}-${cardData.gender_name}`}
        </div>
        <div>
            {cardData.price}
        </div>
    </div>
}