'use client'
import NavHeader from "./_nav/header";
export default function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavHeader />
      {children}
    </>
  );
}
