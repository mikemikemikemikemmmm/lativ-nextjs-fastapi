import { ProductCardRead } from "@/types/product";
import { getImgUrl } from "@/utils/env";
import Link from "next/link";
import { JSX } from "react";

export const ProductCard = (props: { pc: ProductCardRead, children?: JSX.Element }) => {
    const { sub_product_count, id, img_url, gender_name, name } = props.pc
    return <div className="mp2 text-center border hover-blue">
        <Link href={`/product/${id}`}>
            <img className="block mb-2 w-full" src={getImgUrl(img_url)} alt={name} />
            <div>
                {`${name}-${gender_name}`}
            </div>
            <div style={{ color: sub_product_count > 0 ? "black" : "red" }}>
                副產品數量{sub_product_count}
            </div>
        </Link>
        {props.children}
    </div>
}