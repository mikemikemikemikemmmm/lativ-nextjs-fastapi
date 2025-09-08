import { TOKEN_KEY } from "@/utils/constant"
import { isServerComponent } from "@/utils/env"
import { removeToken } from "@/utils/localstorage"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
export const AdminHeader = () => {
    const router = useRouter()
    const [value, setValue] = useState<string | null>(() => isServerComponent ? null : localStorage.getItem(TOKEN_KEY));
    useEffect(() => {
        if (isServerComponent) {
            return
        }
        const onTokenChange = () => {
            setValue(localStorage.getItem(TOKEN_KEY))
        }
        window.addEventListener('tokenChange', onTokenChange);
        return () => {
            window.removeEventListener('tokenChange', onTokenChange);
        };
    }, []);
    const logout = () => {
        removeToken()
        setValue(null)
        router.push('/login')
    }
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
        {
            value ? <span className="mx-2 p-2 btn" onClick={logout}>
                登出
            </span> : <span className="mx-2 p-2 btn" onClick={() => router.push('/login')}>
                登入
            </span>
        }
    </nav>
}