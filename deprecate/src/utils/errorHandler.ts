import { ApiErrorObj } from "@/api/base";
import { notFound } from "next/navigation";

export const errorHandler = (error: string | ApiErrorObj) => {
    notFound()
}