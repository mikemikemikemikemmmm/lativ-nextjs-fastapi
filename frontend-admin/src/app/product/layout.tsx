'use client'
import NavHeader from "./_components/navHeader";
export default function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavHeader />
      <div className="my-1 mx-6 bg-black" style={{height:0.5}} />
      {children}
    </>
  );
}
