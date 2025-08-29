import { ProductDetail, Size, SubProduct } from "@/types/product"
import { useState } from "react"

export const ProductDetailComponent = (props: { productDetail: ProductDetail }) => {
    const { productDetail } = props
    const [subproduct, setSubproduct] = useState<SubProduct>(productDetail.sub_products[0])
    const [size, setSize] = useState<Size>(subproduct.sizes[0])
    return <div>
        <span>
            <img src="" alt="" />
        </span>
        <span>
            <div>
                {`${productDetail.name}-${productDetail.gender_name}（${subproduct.color_name}-${size.name}）`}
            </div>
            <div>
                {subproduct.price}
            </div>
            <div></div>
            <div>
                {
                    productDetail.sub_products.map(sp => <span key={sp.id}>
                        <img src={sp.color_img_url} alt={sp.color_name} />
                    </span>)
                }
            </div>
            <div>
                {
                    subproduct.sizes.map(s => <span key={s.id}>{s.name}</span>)
                }
            </div>
        </span>
    </div>
}