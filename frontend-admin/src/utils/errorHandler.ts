import { ApiErrorObj } from "@/api/base";
import { dispatchError } from "@/store/method";

export const errorHandler = (error:ApiErrorObj)=>{
    dispatchError(error.detail)
}