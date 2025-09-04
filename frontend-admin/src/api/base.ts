import { dispatchError, dispatchSuccess } from "@/store/method";
import { store, increaseLoadingCount, decreaseLoadingCount } from "@/store/store";
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
    options: RequestInit,
    actionName: string = "",
    needLoading: boolean = true
): Promise<ApiResult<Response>> {
    const urlWithBase = `${ENV.backendUrl}/v1/admin/${url}`
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), API_TIMEOUT);
    if (needLoading) {
        store.dispatch(increaseLoadingCount())
    }
    let _actionName = actionName
    if (actionName === "") {
        switch (options.method) {
            case "POST":
                _actionName = "新增"
                break;
            case "PUT":
                _actionName = "修改"
                break;
            case "DELETE":
                _actionName = "刪除"
                break;
            case "GET":
                _actionName = "請求"
                break;
        }
    }
    try {
        const response = await fetch(urlWithBase, { ...options, signal: controller.signal });
        if (!response.ok) {
            const jsonData: ApiErrorObj = await response.json()
            dispatchError(`${_actionName}失敗`)
            return {
                data: undefined,
                error: {
                    detail: jsonData.detail
                }
            } as ErrResult
        }
        const jsonData = await response.json()
        if (options.method !== "GET") {
            dispatchSuccess(`${_actionName}成功`)
        }
        return {
            data: jsonData as Response,
            error: undefined
        } as SuccessResult<Response>
    } catch (error: any) {
        console.error("fetch error", error)
        dispatchError(`${_actionName}失敗`)
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
        if (needLoading) {
            store.dispatch(decreaseLoadingCount())
        }
        clearTimeout(id);
    }
}

export const getApi = <Response>(url: string, options?: RequestInit, actionName?: string) => {
    return baseFetch<Response>(url, {
        ...options, method: "GET"
    }, actionName)
}
export const deleteApi = <Response>(url: string, options?: RequestInit, actionName?: string) => {
    return baseFetch<Response>(url, {
        ...options, method: "DELETE",
    }, actionName)
}
export const postApi = <Response>(url: string, postPayload: object, options?: RequestInit, actionName?: string) => {
    return baseFetch<Response>(url, {
        ...options,
        method: "POST",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(postPayload),
    }, actionName)
}
export const putApi = <Response>(url: string, putPayload: object, options?: RequestInit, actionName?: string) => {
    return baseFetch<Response>(url, {
        ...options,
        method: "PUT",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(putPayload),
    }, actionName)
}