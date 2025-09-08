import "../style/globals.css";
import { WIDTH } from "@/style/cssConst";
import { NavHeader } from "./navHeader";
import { getApi } from "@/api/base";
import { errorHandler } from "@/utils/errorHandler";
import { NavRead } from "@/types";
import { ENV } from "@/utils/env";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html>
      <body>
        <div style={{ width: WIDTH }} className="mx-auto my-10">
          <NavHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
