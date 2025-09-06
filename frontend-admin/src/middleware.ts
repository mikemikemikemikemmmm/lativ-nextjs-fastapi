import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//     console.log(request.url,111)
//     return NextResponse.next();
// }

import { TOKEN_KEY } from "./utils/constant";
import { verifyToken } from "./utils/verifyToken";
import { isServerComponent } from './utils/env';

// 全局中間件
export async function middleware(request: NextRequest) {
    if (isServerComponent) {
        return NextResponse.next();
    }
    const { pathname } = request.nextUrl;
    const whitePaths = ["/login"];

    // 如果是白名單頁面，直接放行
    if (whitePaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }
    // 取得 token（可以是 cookie 或 header）
    const token = localStorage.get(TOKEN_KEY);

    // 未登入就重定向到 /login
    if (!token) {
        return NextResponse.redirect("/login");
    }
    const result = await verifyToken()
    if (result === "token_not_pass") {
        return NextResponse.redirect("/login");
    }
    // 已登入就放行
    return NextResponse.next();
}

// 指定匹配路由
export const matcher = ["/((?!_next|favicon.ico).*)"];