import Link from "next/link"
export const AdminHeader = () => {
    return <nav className="m-4 text-center">
        <Link className="m-2 p-2 btn" href="/category">
            種類
        </Link>
        <Link className="m-2 p-2 btn" href="/product">
            產品
        </Link>
        <Link className="m-2 p-2 btn" href="/color">
            顏色
        </Link>
        <Link className="m-2 p-2 btn" href="/gender">
            性別
        </Link>
        <Link className="m-2 p-2 btn" href="/size">
            尺寸
        </Link>
    </nav>
}