import { API_TIMEOUT } from "@/utils/constant";
import { ENV } from "@/utils/env";
export interface ApiErrorObj {
    detail: string
}
type ErrResult = { data: undefined; error: ApiErrorObj }
type SuccessResult<T> = { data: T; error: undefined }
type ApiResult<T> = SuccessResult<T> | ErrResult
export async function baseFetch<Response>(
    url: string,
    options: RequestInit
): Promise<ApiResult<Response>> {
    const urlWithBase = `${ENV.backendUrl}v1/guest/${url}`
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), API_TIMEOUT);
    try {
        const response = await fetch(urlWithBase, { ...options, signal: controller.signal });
        if (!response.ok) {
            const jsonData: ApiErrorObj = await response.json()
            return {
                data: undefined,
                error: {
                    detail: jsonData.detail
                }
            } as ErrResult
        }
        const jsonData = await response.json()
        return {
            data: jsonData as Response,
            error: undefined
        } as SuccessResult<Response>
    } catch (error: any) {
        console.error("fetch error", error)
        if (error.name === "AbortError") {
            return {
                data: undefined,
                error: {
                    detail: "請求超時"
                }
            } as ErrResult
        }
        if (typeof error === "string") {
            return {
                data: undefined,
                error: {
                    detail: error
                }
            } as ErrResult
        }
        if (error instanceof Error) {
            return {
                data: undefined,
                error: {
                    detail: error.message
                }
            } as ErrResult
        }
        return {
            data: undefined,
            error: {
                detail: "未知錯誤"
            }
        } as ErrResult
    } finally {
        clearTimeout(id);
    }
}

export const getApi = <Response>(url: string, options?: RequestInit) => {
    return baseFetch<Response>(url, {
        ...options, method: "GET"
    })
}