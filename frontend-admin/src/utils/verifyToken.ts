import { baseFetch } from "@/api/base"
import { errorHandler } from "./errorHandler"

export const verifyToken = async () => {
    const { error } = await baseFetch("login/verify_token", { method: "POST" }, "登入", true, true)
    if (error) {
        errorHandler(error)
        return "token_not_pass"
    }
    return "token_pass"
}