import { dispatchError, dispatchSuccess } from "@/store/method";
import { store, increaseLoadingCount, decreaseLoadingCount } from "@/store/store";
import { API_TIMEOUT } from "@/utils/constant";
import { ENV } from "@/utils/env";
export interface ApiErrorObj {
    detail: string
} //TODO
type ErrResult = { data: undefined; error: ApiErrorObj }
type SuccessResult<T> = { data: T; error: undefined }
type ApiResult<T> = SuccessResult<T> | ErrResult
export async function baseFetch<Response>(url: string, options?: RequestInit, alertStr?: string): Promise<ApiResult<Response>> {
    const urlWithBase = `${ENV.backendUrl}/v1/${url}`
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), API_TIMEOUT);
    store.dispatch(increaseLoadingCount())
    try {
        const response = await fetch(urlWithBase, { ...options, signal: controller.signal });
        if (!response.ok) {
            console.log("a", response)
            return {
                data: undefined,
                error: {
                    detail: "TODO"
                }
            } as ErrResult
        }
        const jsonData = await response.json()
        if (alertStr) {
            dispatchSuccess(alertStr)
        } else {
            const method = options?.method
            switch (method) {
                case "POST":
                    dispatchSuccess("新增成功")
                    break;
                case "PUT":
                    dispatchSuccess("修改成功")
                    break;
                case "DELETE":
                    dispatchSuccess("刪除成功")
                    break;
            }
        }
        return {
            data: jsonData as Response,
            error: undefined
        } as SuccessResult<Response>
    } catch (error: any) {
        console.log("error", error)
        if (error.name === "AbortError") {
            return {
                data: undefined,
                error: {
                    detail: "請求超時"
                }
            } as ErrResult
        }
        return {
            data: undefined,
            error: {
                detail: "TODO"
            }
        } as ErrResult
    } finally {
        store.dispatch(decreaseLoadingCount())
        clearTimeout(id);
    }
}

export const getApi = <Response>(url: string, options?: RequestInit) => {
    return baseFetch<Response>(url, {
        method: "GET", ...options
    })
}
export const deleteApi = <Response>(url: string, options?: RequestInit) => {
    return baseFetch<Response>(url, {
        method: "DELETE", ...options
    })
}
export const postApi = <Response>(url: string, postPayload: object, options?: RequestInit) => {
    return baseFetch<Response>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(postPayload),
        ...options
    })
}
export const putApi = <Response>(url: string, putPayload: object, options?: RequestInit) => {
    return baseFetch<Response>(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(putPayload),
        ...options
    })
}