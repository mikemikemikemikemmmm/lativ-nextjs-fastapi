'use client'
import "../style/globals.css";
import { AdminHeader } from "@/components/header";
import StoreProvider from "@/store/provider"
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import theme from "@/style/theme";
import { ThemeProvider } from '@mui/material/styles';
import { Alarm } from "@mui/icons-material";
import { AlertContainer } from "@/components/alertContainer";
import { WIDTH } from "@/style/cssConst";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="mx-auto mt-6" style={{ width: WIDTH }}>
        <AppRouterCacheProvider>
          <StoreProvider>
            <ThemeProvider theme={theme}>
              <AlertContainer />
              <AdminHeader />
              {children}
            </ThemeProvider>
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
