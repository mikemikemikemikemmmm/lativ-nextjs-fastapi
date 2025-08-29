import type { Metadata } from "next";
import "../style/globals.css";
import { WIDTH } from "@/style/cssConst";
import { AdminHeader } from "@/components/header";
import StoreProvider from "@/store/provider"
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  StoreProvider
  return (
    <html>
      <body className="mx-6 mt-6">
        <AppRouterCacheProvider>
          <StoreProvider>
            <AdminHeader />
            {children}
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
