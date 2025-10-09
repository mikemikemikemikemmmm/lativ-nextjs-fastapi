import "../style/globals.css";
import { WIDTH } from "@/style/cssConst";
import { NavHeader } from "../components/navHeader";
import { Outlet } from "react-router";
export default function RootLayout() {
  return <div style={{ width: WIDTH }} className="mx-auto my-10">
    <NavHeader/>
    <Outlet />
  </div>
}
