import Image from "next/image";
import { Logo } from "@/components/logo"
import { Footer } from "@/components/footer"
import { getApi } from "@/api/base";
import { guestErrorHandler } from "@/utils/errorHandler";
import { NavHeader } from "@/components/header/navHeader";
import { NavResponse } from "@/types/nav";
export default async function Home() {
  const { data, error } = await getApi<NavResponse[]>("navs")
  if (error) {
    return guestErrorHandler(error)
  }
  NavHeader
  return (
    <div>
      <NavHeader navData={data} />
      index
      <Footer />
    </div>
  );
}
