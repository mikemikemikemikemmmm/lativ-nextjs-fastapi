const backendBaseUrl = process.env.BACKEND_BASE_URL;
export interface ApiErrorObj {
    detail: string
} //TODO
type ErrResult = { data: undefined; error: ApiErrorObj }
type SuccessResult<T> = { data: T; error: undefined }
type ApiResult<T> = SuccessResult<T> | ErrResult
async function baseFetch<Response>(url: string, options?: RequestInit): Promise<ApiResult<Response>> {
    const urlWithBase = backendBaseUrl + "/" + url
    try {
        const response = await fetch(urlWithBase, options);
        if (!response.ok) {
            return {
                data: undefined,
                error: {
                    detail: "TODO"
                }
            } as ErrResult
        }
        const jsonData = await response.json()
        return {
            data: jsonData as Response,
            error: undefined
        } as SuccessResult<Response>
    } catch (error) {
        return {
            data: undefined,
            error: {
                detail: "TODO"
            }
        } as ErrResult
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