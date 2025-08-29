import Link from "next/link"
import Button from '@mui/material/Button';

export const AdminHeader = () => {
    return <nav className="m-10 flex justify-around">
        <Button variant="contained">
            <Link href="/product">
                產品
            </Link>
        </Button>
        <Button variant="contained">
            <Link href="/color">
                顏色
            </Link>
        </Button>
        <Button variant="contained">
            <Link href="/gender">
                性別
            </Link>
        </Button>
        <Button variant="contained">
            <Link href="/size">
                尺寸
            </Link>
        </Button>
    </nav>
}