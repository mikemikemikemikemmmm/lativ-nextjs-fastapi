import { redirect } from "react-router"

export const redirectTo404 = () => {
    throw redirect("/404")
}