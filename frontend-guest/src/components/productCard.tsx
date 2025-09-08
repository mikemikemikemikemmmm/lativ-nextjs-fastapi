import { ProductCardRead } from "@/types";
import { getImgUrl } from "@/utils/env";
import Image from "next/image";
import Link from "next/link";

export const ProductCard = (props: { pc: ProductCardRead }) => {
    const { pc } = props
    return <div className="flex flex-col text-center">
        <Link href={`/product/${pc.id}`} className="block mb-2" >
            <Image height={1200} width={800}  src={getImgUrl(pc.img_url)} alt={pc.name} />
        </Link>

        <div className="flext justify-center items-center">
            {
                pc.sub_products.map(sp => <Link href={`/product/${pc.id}?sub_product_id=${sp.id}`} className="inline-block my-2 mx-1" style={{ width: 16, height: 16 }} key={sp.id}>
                    <Image height={48} width={48} src={getImgUrl(sp.color_img_file_name)} className="w-full h-full" alt={sp.color_name} />
                </Link>)
            }
        </div>
        <div className="mb-2">
            {pc.name}-{pc.gender_name}
        </div>
        <div className="mt-auto">
            NT$ {
                pc.sub_products.reduce((prev, curr) => {
                    return curr.price < prev.price ? curr : prev;
                }).price
            }</div>
    </div>
}