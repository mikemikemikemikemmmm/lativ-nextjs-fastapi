import { LOGO_FONT_SIZE } from "@/style/cssConst"
import Link from "next/link"

export const Logo = () => {
    return <Link style={{ fontSize: LOGO_FONT_SIZE }} href="/">lativ</Link>
}