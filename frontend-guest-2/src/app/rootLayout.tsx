import "../style/globals.css";
import { WIDTH } from "@/style/cssConst";
import { NavHeader } from "../components/navHeader";
import { Outlet, useLoaderData } from "react-router";
import { getApi } from "@/api/base";
import type { NavRead } from "@/types";
import { redirectTo404 } from "@/utils/errorHandler";
export const rootLoader = async () => {
  const { data, error } = await getApi<NavRead[]>("navs")
  if (error) {
    return redirectTo404()
  }
  return {
    navs: data
  }
}
export default function RootLayout() {
    const { navs } = useLoaderData<{ navs: NavRead[] }>();
  return <div style={{ width: WIDTH }} className="mx-auto my-10">
    <NavHeader navs={navs}/>
    <Outlet />
  </div>
}
