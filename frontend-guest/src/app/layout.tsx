import "../style/globals.css";
import { WIDTH } from "@/style/cssConst";
import { NavHeader } from "./navHeader";
import { getApi } from "@/api/base";
import { errorHandler } from "@/utils/errorHandler";
import { NavRead } from "@/types";
import { ENV } from "@/utils/env";

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const { data, error } = await getApi<NavRead[]>("navs")
  if (error) {
    return <html>
      <body className="text-9xl flex justify-center items-center" style={{ width: WIDTH }}>
        error
      </body>
    </html>
  }
  return (
    <html>
      <body>
        <div style={{ width: WIDTH }} className="mx-auto my-10">
          <NavHeader navs={data}  />
          {children}
        </div>
      </body>
    </html>
  );
}
