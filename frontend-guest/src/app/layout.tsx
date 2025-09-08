import "../style/globals.css";
import { WIDTH } from "@/style/cssConst";
import { NavHeader } from "./navHeader";

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
