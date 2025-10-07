'use client'
import { getApi } from "@/api/base"
// import { errorHandler } from "@/utils/errorHandler"
import { useEffect, useState } from "react"

export function useGetData<Response>(url: string): [() => Promise<void>, Response[] | "loading"] {
    const [data, setData] = useState<Response[] | "loading">("loading")
    const getData = async () => {
        const { data, error } = await getApi<Response[]>(url)
        if (error) {
            return 
        }
        setData(data)
    }
    useEffect(() => { getData() }, [])
    return [getData, data]
}   